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
  temperature: 0.4,
});

// System prompt for blending multiple sources
const BLEND_SYSTEM_PROMPT = `You are a Data Blending Engine for a data marketplace. You are processing content from MULTIPLE source types (files, web sources, and AI-generated content) to create a comprehensive, unified dataset.

Your task is to:
1. Combine and synthesize information from all sources
2. Identify common themes and connections
3. Resolve any conflicts or inconsistencies
4. Create a cohesive, valuable dataset

Return ONLY valid JSON:
{
  "generatedName": "Marketable name for this blended dataset (max 60 chars)",
  "generatedDescription": "2-3 sentence compelling description highlighting the multi-source nature",
  "title": "Unified dataset title",
  "summary": "Comprehensive summary of all blended content",
  "entities": {
    "people": ["All person names from all sources"],
    "organizations": ["All organizations from all sources"],
    "locations": ["All locations from all sources"],
    "dates": ["All time periods covered"],
    "concepts": ["Key concepts and themes across all sources"]
  },
  "sentiment": {
    "overall": "positive | negative | neutral | mixed",
    "confidence": 0.0 to 1.0,
    "explanation": "Overall sentiment across all sources"
  },
  "keywords": ["15-20 keywords from all sources"],
  "category": "Best fitting category",
  "language": "Primary language",
  "wordCount": number,
  "sourceBreakdown": {
    "files": number,
    "webSources": number,
    "aiEnhanced": boolean
  },
  "metadata": {
    "documentType": "blended-dataset",
    "complexity": "low | medium | high",
    "actionItems": ["Insights and recommendations"],
    "dataCoverage": "Description of what the blended data covers"
  }
}`;

interface BlendedSources {
  files: { filename: string; content: string; size: number }[];
  webContents: { source: string; content: string }[];
  aiPrompt: string;
  aiContent?: string;
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

// Process file and extract text
async function extractTextFromFile(filePath: string, mimeType: string, filename: string): Promise<string> {
  const extension = path.extname(filename).toLowerCase();
  if (mimeType === 'application/pdf' || extension === '.pdf') {
    return await extractTextFromPDF(filePath);
  }
  return await extractTextFromTXT(filePath);
}

// Fetch URL content
async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InflectivBot/1.0)' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 20000);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return `[Could not fetch: ${url}]`;
  }
}

// Process search query using AI
async function processSearchQuery(query: string): Promise<string> {
  const searchModel = new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.5,
  });

  const response = await searchModel.invoke([
    new SystemMessage('Provide comprehensive, factual information about the topic. Include data points, statistics, and current information.'),
    new HumanMessage(`Research: ${query}`),
  ]);

  return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
}

// Generate AI content based on prompt
async function generateAIContent(prompt: string): Promise<string> {
  const response = await model.invoke([
    new SystemMessage('Generate comprehensive data based on the user request. Be detailed and factual.'),
    new HumanMessage(prompt),
  ]);
  return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
}

// Blend all sources together
async function blendAllSources(sources: BlendedSources): Promise<Record<string, unknown>> {
  let combinedContent = '';

  // Add file contents
  if (sources.files.length > 0) {
    combinedContent += '\n\n=== FILE SOURCES ===\n';
    sources.files.forEach((f, i) => {
      combinedContent += `\n--- File ${i + 1}: ${f.filename} ---\n${f.content}\n`;
    });
  }

  // Add web contents
  if (sources.webContents.length > 0) {
    combinedContent += '\n\n=== WEB SOURCES ===\n';
    sources.webContents.forEach((w, i) => {
      combinedContent += `\n--- Web ${i + 1}: ${w.source} ---\n${w.content}\n`;
    });
  }

  // Add AI content
  if (sources.aiContent) {
    combinedContent += '\n\n=== AI-ENHANCED CONTENT ===\n';
    combinedContent += `Prompt: ${sources.aiPrompt}\n\nGenerated:\n${sources.aiContent}\n`;
  }

  // Truncate if too long
  if (combinedContent.length > 100000) {
    combinedContent = combinedContent.substring(0, 100000) + '\n\n[Content truncated...]';
  }

  const messages = [
    new SystemMessage(BLEND_SYSTEM_PROMPT),
    new HumanMessage(`BLENDED SOURCES:\n${combinedContent}`),
  ];

  const response = await model.invoke(messages);
  const responseText = typeof response.content === 'string'
    ? response.content
    : JSON.stringify(response.content);

  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    return JSON.parse(jsonStr);
  } catch {
    return {
      generatedName: 'Blended Multi-Source Dataset',
      generatedDescription: 'A comprehensive dataset combining files, web sources, and AI-generated content.',
      title: 'Blended Dataset',
      summary: 'Combined data from multiple source types.',
      entities: { people: [], organizations: [], locations: [], dates: [], concepts: [] },
      sentiment: { overall: 'neutral', confidence: 0.5, explanation: 'Mixed sources' },
      keywords: [],
      category: 'general',
      language: 'English',
      wordCount: combinedContent.split(/\s+/).length,
      sourceBreakdown: {
        files: sources.files.length,
        webSources: sources.webContents.length,
        aiEnhanced: !!sources.aiContent,
      },
      metadata: { documentType: 'blended-dataset', complexity: 'high', actionItems: [] },
    };
  }
}

export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];

  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const urlsJson = formData.get('urls') as string;
    const searchQueriesJson = formData.get('searchQueries') as string;
    const aiPrompt = formData.get('aiPrompt') as string;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const urls: string[] = urlsJson ? JSON.parse(urlsJson) : [];
    const searchQueries: string[] = searchQueriesJson ? JSON.parse(searchQueriesJson) : [];

    const blendedSources: BlendedSources = {
      files: [],
      webContents: [],
      aiPrompt: aiPrompt || '',
    };

    // Process files
    const tempDir = os.tmpdir();
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && key.startsWith('file')) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${value.name}`);
        await fs.writeFile(tempFilePath, buffer);
        tempFiles.push(tempFilePath);

        try {
          const content = await extractTextFromFile(tempFilePath, value.type, value.name);
          if (content.trim()) {
            blendedSources.files.push({
              filename: value.name,
              content: content.substring(0, 30000),
              size: value.size,
            });
          }
        } catch (err) {
          console.error(`Error processing ${value.name}:`, err);
        }
      }
    }

    // Process URLs
    for (const url of urls) {
      const content = await fetchUrlContent(url);
      blendedSources.webContents.push({ source: url, content });
    }

    // Process search queries
    for (const query of searchQueries) {
      const content = await processSearchQuery(query);
      blendedSources.webContents.push({ source: `Search: ${query}`, content });
    }

    // Generate AI content if prompt provided
    if (aiPrompt && aiPrompt.trim()) {
      blendedSources.aiContent = await generateAIContent(aiPrompt);
    }

    // Check if we have any content
    const totalSources =
      blendedSources.files.length +
      blendedSources.webContents.length +
      (blendedSources.aiContent ? 1 : 0);

    if (totalSources === 0) {
      return NextResponse.json({ error: 'No valid sources provided' }, { status: 400 });
    }

    // Blend all sources
    const structuredData = await blendAllSources(blendedSources);

    // Generate token ID
    const tokenId = `INFL-${Date.now().toString(36).toUpperCase()}`;

    // Store in database
    const { data: asset, error: dbError } = await supabaseAdmin
      .from('assets')
      .insert({
        user_id: userId,
        token_id: tokenId,
        name: (structuredData.generatedName as string) || 'Blended Dataset',
        description: (structuredData.generatedDescription as string) || null,
        category: (structuredData.category as string) || 'general',
        tags: (structuredData.keywords as string[]) || [],
        structured_data: structuredData,
        original_filename: [
          ...blendedSources.files.map((f) => f.filename),
          ...urls,
          ...searchQueries.map((q) => `search:${q}`),
          aiPrompt ? 'ai-enhanced' : '',
        ]
          .filter(Boolean)
          .join(', '),
        file_type: 'blended',
        file_size:
          blendedSources.files.reduce((acc, f) => acc + f.size, 0) +
          blendedSources.webContents.reduce((acc, w) => acc + w.content.length, 0) +
          (blendedSources.aiContent?.length || 0),
        status: 'active',
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to store asset' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      assetId: asset.id,
      tokenId,
      processedAt: new Date().toISOString(),
      generatedName: structuredData.generatedName,
      generatedDescription: structuredData.generatedDescription,
      category: structuredData.category,
      sourceBreakdown: {
        files: blendedSources.files.length,
        webSources: blendedSources.webContents.length,
        aiEnhanced: !!blendedSources.aiContent,
      },
    });
  } catch (error) {
    console.error('Blend error:', error);
    return NextResponse.json(
      { error: `Failed to blend sources: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  } finally {
    for (const tempFile of tempFiles) {
      try {
        await fs.unlink(tempFile);
      } catch {
        // Ignore
      }
    }
  }
}
