import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { supabaseAdmin } from '@/server/supabase';

// Initialize LangChain with Gemini
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.3,
});

// System prompt for web data structuring
const SYSTEM_PROMPT = `You are a Data Structuring Engine for a data marketplace. You are processing web content to create a tradeable data asset.

Based on the provided web content (from URLs and/or search queries), create a comprehensive structured dataset.

Return ONLY valid JSON in the following format:
{
  "generatedName": "A concise, marketable name for this web-sourced dataset (max 60 chars)",
  "generatedDescription": "A compelling 2-3 sentence description for the marketplace",
  "title": "Dataset title",
  "summary": "A comprehensive summary of the web content",
  "entities": {
    "people": ["Person names found"],
    "organizations": ["Organizations/companies found"],
    "locations": ["Locations found"],
    "dates": ["Dates/time periods found"],
    "concepts": ["Key concepts and themes"]
  },
  "sentiment": {
    "overall": "positive | negative | neutral | mixed",
    "confidence": 0.0 to 1.0,
    "explanation": "Sentiment analysis explanation"
  },
  "keywords": ["Top 10-15 keywords"],
  "category": "Category (financial, legal, technical, medical, research, business, general)",
  "language": "Detected language",
  "wordCount": number,
  "sources": ["List of source URLs or search queries used"],
  "metadata": {
    "documentType": "web-sourced",
    "complexity": "low | medium | high",
    "actionItems": ["Recommendations or insights"],
    "dataFreshness": "Estimated data freshness"
  }
}`;

interface WebSource {
  type: 'url' | 'search';
  value: string;
}

// Fetch URL content using a simple fetch (for demonstration)
async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InflectivBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Basic HTML to text conversion (strip tags)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return textContent.substring(0, 30000); // Limit content
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return `[Could not fetch content from ${url}]`;
  }
}

// Process search query using AI (since we don't have actual search API)
async function processSearchQuery(query: string): Promise<string> {
  // Use Gemini to generate relevant information about the search topic
  const searchModel = new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.5,
  });

  const response = await searchModel.invoke([
    new SystemMessage(
      'You are a research assistant. Provide comprehensive, factual information about the given topic. Include relevant data points, statistics, key facts, and current information. Format as detailed paragraphs.'
    ),
    new HumanMessage(`Research topic: ${query}\n\nProvide detailed, structured information about this topic that could be used to build a dataset.`),
  ]);

  return typeof response.content === 'string'
    ? response.content
    : JSON.stringify(response.content);
}

// Structure the web content
async function structureWebData(
  sources: WebSource[],
  contents: { source: string; content: string }[]
): Promise<Record<string, unknown>> {
  const combinedContent = contents
    .map((c) => `\n--- SOURCE: ${c.source} ---\n${c.content}`)
    .join('\n\n');

  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`WEB SOURCES (${sources.length} sources):\n\n${combinedContent}`),
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
      generatedName: 'Web-Sourced Dataset',
      generatedDescription: 'A dataset compiled from web sources.',
      title: 'Web Data Collection',
      summary: 'Data collected from various web sources.',
      entities: { people: [], organizations: [], locations: [], dates: [], concepts: [] },
      sentiment: { overall: 'neutral', confidence: 0, explanation: 'Analysis incomplete' },
      keywords: [],
      category: 'general',
      language: 'English',
      wordCount: combinedContent.split(/\s+/).length,
      sources: sources.map((s) => s.value),
      metadata: { documentType: 'web-sourced', complexity: 'medium', actionItems: [] },
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, sources } = body as { userId: string; sources: WebSource[] };

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!sources || sources.length === 0) {
      return NextResponse.json(
        { error: 'No web sources provided' },
        { status: 400 }
      );
    }

    // Process each source
    const contents: { source: string; content: string }[] = [];

    for (const source of sources) {
      if (source.type === 'url') {
        const content = await fetchUrlContent(source.value);
        contents.push({ source: source.value, content });
      } else if (source.type === 'search') {
        const content = await processSearchQuery(source.value);
        contents.push({ source: `Search: ${source.value}`, content });
      }
    }

    // Structure the data
    const structuredData = await structureWebData(sources, contents);

    // Generate token ID
    const tokenId = `INFL-${Date.now().toString(36).toUpperCase()}`;

    // Store in database
    const { data: asset, error: dbError } = await supabaseAdmin
      .from('assets')
      .insert({
        user_id: userId,
        token_id: tokenId,
        name: (structuredData.generatedName as string) || 'Web-Sourced Dataset',
        description: (structuredData.generatedDescription as string) || null,
        category: (structuredData.category as string) || 'general',
        tags: (structuredData.keywords as string[]) || [],
        structured_data: structuredData,
        original_filename: sources.map((s) => s.value).join(', '),
        file_type: 'web',
        file_size: contents.reduce((acc, c) => acc + c.content.length, 0),
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
      sourcesProcessed: sources.length,
      processedAt: new Date().toISOString(),
      generatedName: structuredData.generatedName,
      generatedDescription: structuredData.generatedDescription,
      category: structuredData.category,
    });
  } catch (error) {
    console.error('Web ingestion error:', error);
    return NextResponse.json(
      { error: `Failed to process web sources: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
