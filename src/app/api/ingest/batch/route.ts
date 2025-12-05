import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { PDFParse } from 'pdf-parse';
import { supabaseAdmin } from '@/server/supabase';

// Initialize LangChain with Gemini
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.3,
});

// System prompt for data structuring
const SYSTEM_PROMPT = `You are a Data Structuring Engine for a data marketplace. Analyze these documents and extract key information to create a comprehensive tradeable data asset.

You are processing MULTIPLE documents that should be combined into a single cohesive dataset.

Return ONLY valid JSON in the following format:
{
  "generatedName": "A concise, marketable name for this combined dataset (max 60 chars)",
  "generatedDescription": "A compelling 2-3 sentence description that would attract buyers on a data marketplace",
  "title": "Combined document title or inferred title",
  "summary": "A concise 2-3 sentence summary of all the combined document content",
  "entities": {
    "people": ["List of person names mentioned across all documents"],
    "organizations": ["List of organizations/companies mentioned"],
    "locations": ["List of locations/places mentioned"],
    "dates": ["List of dates or time periods mentioned"],
    "concepts": ["Key concepts, topics, or themes"]
  },
  "sentiment": {
    "overall": "positive | negative | neutral | mixed",
    "confidence": 0.0 to 1.0,
    "explanation": "Brief explanation of sentiment analysis"
  },
  "keywords": ["Top 10-15 keywords from all documents"],
  "category": "Document category (financial, legal, technical, medical, research, business, general)",
  "language": "Detected language",
  "wordCount": number,
  "sourceCount": number,
  "metadata": {
    "documentType": "Type of combined dataset",
    "complexity": "low | medium | high",
    "actionItems": ["Any action items or recommendations found"]
  }
}`;

interface ProcessedFile {
  filename: string;
  content: string;
  size: number;
}

// Extract text from PDF
async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: new Uint8Array(dataBuffer) });
  const textResult = await parser.getText();
  await parser.destroy();
  return textResult.text;
}

// Extract text from TXT file
async function extractTextFromTXT(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8');
}

// Process file and extract text based on type
async function extractTextFromFile(filePath: string, mimeType: string, filename: string): Promise<string> {
  const extension = path.extname(filename).toLowerCase();

  if (mimeType === 'application/pdf' || extension === '.pdf') {
    return await extractTextFromPDF(filePath);
  } else if (
    mimeType === 'text/plain' ||
    extension === '.txt' ||
    extension === '.md' ||
    extension === '.csv'
  ) {
    return await extractTextFromTXT(filePath);
  } else {
    throw new Error(`Unsupported file type: ${mimeType || extension}`);
  }
}

// Send combined text to Gemini via LangChain for structuring
async function structureCombinedData(processedFiles: ProcessedFile[]): Promise<Record<string, unknown>> {
  const combinedContent = processedFiles
    .map((f, i) => `\n--- DOCUMENT ${i + 1}: ${f.filename} ---\n${f.content}`)
    .join('\n\n');

  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`COMBINED DOCUMENTS (${processedFiles.length} files):\n\n${combinedContent}`),
  ];

  const response = await model.invoke(messages);
  const responseText = typeof response.content === 'string'
    ? response.content
    : JSON.stringify(response.content);

  // Extract JSON from response
  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    return JSON.parse(jsonStr);
  } catch {
    console.error('Failed to parse Gemini response as JSON:', responseText);
    return {
      generatedName: 'Combined Dataset',
      generatedDescription: 'A combined data asset from multiple sources.',
      title: 'Combined Dataset',
      summary: 'Combined data from multiple files.',
      entities: { people: [], organizations: [], locations: [], dates: [], concepts: [] },
      sentiment: { overall: 'neutral', confidence: 0, explanation: 'Analysis failed' },
      keywords: [],
      category: 'general',
      language: 'unknown',
      wordCount: combinedContent.split(/\s+/).length,
      sourceCount: processedFiles.length,
      metadata: { documentType: 'combined', complexity: 'medium', actionItems: [] },
    };
  }
}

export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];

  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const userId = formData.get('userId') as string;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all files from form data
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && key.startsWith('file')) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Process each file
    const processedFiles: ProcessedFile[] = [];
    const tempDir = os.tmpdir();

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${file.name}`);
      await fs.writeFile(tempFilePath, buffer);
      tempFiles.push(tempFilePath);

      try {
        const content = await extractTextFromFile(tempFilePath, file.type, file.name);
        if (content.trim()) {
          processedFiles.push({
            filename: file.name,
            content: content.substring(0, 50000), // Limit per file
            size: file.size,
          });
        }
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err);
      }
    }

    if (processedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid content could be extracted from the files' },
        { status: 400 }
      );
    }

    // Structure the combined data
    const structuredData = await structureCombinedData(processedFiles);

    // Generate token ID
    const tokenId = `INFL-${Date.now().toString(36).toUpperCase()}`;

    // Store in database
    const { data: asset, error: dbError } = await supabaseAdmin
      .from('assets')
      .insert({
        user_id: userId,
        token_id: tokenId,
        name: (structuredData.generatedName as string) || 'Combined Dataset',
        description: (structuredData.generatedDescription as string) || null,
        category: (structuredData.category as string) || 'general',
        tags: (structuredData.keywords as string[]) || [],
        structured_data: structuredData,
        original_filename: processedFiles.map((f) => f.filename).join(', '),
        file_type: 'multiple',
        file_size: processedFiles.reduce((acc, f) => acc + f.size, 0),
        status: 'active',
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to store asset in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      assetId: asset.id,
      tokenId,
      filesProcessed: processedFiles.length,
      filenames: processedFiles.map((f) => f.filename),
      totalSize: processedFiles.reduce((acc, f) => acc + f.size, 0),
      processedAt: new Date().toISOString(),
      generatedName: structuredData.generatedName,
      generatedDescription: structuredData.generatedDescription,
      category: structuredData.category,
    });
  } catch (error) {
    console.error('Batch ingestion error:', error);
    return NextResponse.json(
      { error: `Failed to process files: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  } finally {
    // Cleanup temp files
    for (const tempFile of tempFiles) {
      try {
        await fs.unlink(tempFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
