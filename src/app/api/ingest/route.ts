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
const SYSTEM_PROMPT = `You are a Data Structuring Engine for a data marketplace. Analyze this document and extract key information to create a tradeable data asset.

Return ONLY valid JSON in the following format:
{
  "generatedName": "A concise, marketable name for this dataset (max 60 chars)",
  "generatedDescription": "A compelling 2-3 sentence description that would attract buyers on a data marketplace",
  "title": "Document title or inferred title",
  "summary": "A concise 2-3 sentence summary of the document content",
  "entities": {
    "people": ["List of person names mentioned"],
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
  "keywords": ["Top 5-10 keywords"],
  "category": "Document category (financial, legal, technical, medical, research, business, general)",
  "language": "Detected language",
  "wordCount": number,
  "metadata": {
    "documentType": "Type of document (report, article, contract, dataset, etc.)",
    "complexity": "low | medium | high",
    "actionItems": ["Any action items or recommendations found"]
  }
}

For generatedName: Create a professional, marketable name that describes the data value (e.g., "Q3 2024 Market Analysis Report", "Customer Sentiment Dataset", "Financial Metrics Collection")
For generatedDescription: Write a description that highlights the value and potential use cases of this data asset.

Analyze the document thoroughly and provide accurate, detailed extraction. If a field cannot be determined, use null or an empty array as appropriate.`;

interface ParsedFile {
  filepath: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

// Parse multipart form data from request
async function parseFormData(request: NextRequest): Promise<{ files: ParsedFile[]; userId?: string }> {
  const formData = await request.formData();
  const files: ParsedFile[] = [];
  let userId: string | undefined;

  for (const [key, value] of formData.entries()) {
    if (key === 'userId' && typeof value === 'string') {
      userId = value;
    } else if (value instanceof File) {
      const buffer = Buffer.from(await value.arrayBuffer());
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${value.name || 'file'}`);

      await fs.writeFile(tempFilePath, buffer);

      files.push({
        filepath: tempFilePath,
        originalFilename: value.name || 'file',
        mimetype: value.type,
        size: value.size,
      });
    }
  }

  return { files, userId };
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
  const content = await fs.readFile(filePath, 'utf-8');
  return content;
}

// Process file and extract text based on type
async function extractTextFromFile(filePath: string, mimeType: string, filename: string): Promise<string> {
  const extension = path.extname(filename).toLowerCase();

  if (mimeType === 'application/pdf' || extension === '.pdf') {
    return extractTextFromPDF(filePath);
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

// Send text to Gemini via LangChain for structuring
async function structureDataWithLangChain(text: string): Promise<object> {
  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`DOCUMENT CONTENT:\n\n${text}`),
  ];

  const response = await model.invoke(messages);
  const responseText = typeof response.content === 'string'
    ? response.content
    : JSON.stringify(response.content);

  // Extract JSON from response (handle potential markdown code blocks)
  let jsonStr = responseText;

  // Remove markdown code blocks if present
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Parse and validate JSON
  try {
    const parsed = JSON.parse(jsonStr);
    return parsed;
  } catch (parseError) {
    // If JSON parsing fails, return a structured error response
    console.error('Failed to parse Gemini response as JSON:', responseText);
    return {
      error: 'Failed to parse AI response',
      rawResponse: responseText,
      generatedName: 'Untitled Dataset',
      generatedDescription: 'A data asset processed by Inflectiv.',
      title: 'Unknown',
      summary: 'Failed to extract summary',
      entities: { people: [], organizations: [], locations: [], dates: [], concepts: [] },
      sentiment: { overall: 'neutral', confidence: 0, explanation: 'Analysis failed' },
      keywords: [],
      category: 'general',
      language: 'unknown',
      wordCount: text.split(/\s+/).length,
      metadata: { documentType: 'unknown', complexity: 'unknown', actionItems: [] }
    };
  }
}

// Store asset in Supabase
async function storeAssetInDatabase(
  userId: string,
  tokenId: string,
  structuredData: Record<string, unknown>,
  filename: string,
  fileType: string,
  fileSize: number
): Promise<{ id: string } | null> {
  const { data, error } = await supabaseAdmin
    .from('assets')
    .insert({
      user_id: userId,
      token_id: tokenId,
      name: (structuredData.generatedName as string) || 'Untitled Dataset',
      description: (structuredData.generatedDescription as string) || null,
      category: (structuredData.category as string) || 'general',
      tags: (structuredData.keywords as string[]) || [],
      structured_data: structuredData,
      original_filename: filename,
      file_type: fileType,
      file_size: fileSize,
      status: 'active',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to store asset in database:', error);
    return null;
  }

  return data;
}

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please set GEMINI_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    // Parse the form data
    const { files, userId } = await parseFormData(request);

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required. Please ensure you are logged in.' },
        { status: 400 }
      );
    }

    // Get the uploaded file
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No file uploaded. Please upload a PDF or TXT file.' },
        { status: 400 }
      );
    }

    const file = files[0];
    tempFilePath = file.filepath;
    const filename = file.originalFilename || 'unknown';
    const mimeType = file.mimetype || '';

    // Validate file type
    const validTypes = ['application/pdf', 'text/plain', 'text/csv', 'text/markdown'];
    const validExtensions = ['.pdf', '.txt', '.md', '.csv'];
    const extension = path.extname(filename).toLowerCase();

    if (!validTypes.includes(mimeType) && !validExtensions.includes(extension)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${mimeType || extension}. Supported types: PDF, TXT, MD, CSV` },
        { status: 400 }
      );
    }

    // Extract text from file
    const extractedText = await extractTextFromFile(tempFilePath, mimeType, filename);

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text content could be extracted from the file.' },
        { status: 400 }
      );
    }

    // Truncate text if too long (Gemini has token limits)
    const maxChars = 100000; // ~25k tokens approximately
    const truncatedText = extractedText.length > maxChars
      ? extractedText.substring(0, maxChars) + '\n\n[Content truncated due to length...]'
      : extractedText;

    // Send to Gemini via LangChain for structuring
    const structuredData = await structureDataWithLangChain(truncatedText) as Record<string, unknown>;

    // Generate a unique token ID for this data asset
    const tokenId = `INFL-${Date.now().toString(36).toUpperCase()}`;

    // Store asset in Supabase
    const storedAsset = await storeAssetInDatabase(
      userId,
      tokenId,
      structuredData,
      filename,
      mimeType || extension,
      file.size
    );

    if (!storedAsset) {
      return NextResponse.json(
        { error: 'Failed to store asset in database. Please try again.' },
        { status: 500 }
      );
    }

    // Return success response with generated name and description
    return NextResponse.json({
      success: true,
      assetId: storedAsset.id,
      tokenId,
      filename,
      fileSize: file.size,
      mimeType,
      processedAt: new Date().toISOString(),
      generatedName: structuredData.generatedName || 'Untitled Dataset',
      generatedDescription: structuredData.generatedDescription || 'A data asset processed by Inflectiv.',
      category: structuredData.category || 'general',
    });

  } catch (error) {
    console.error('Ingestion error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: `Failed to process file: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Inflectiv Ingestion Engine',
    supportedTypes: ['PDF', 'TXT', 'MD', 'CSV'],
    version: '2.0.0',
    engine: 'LangChain + Gemini',
  });
}
