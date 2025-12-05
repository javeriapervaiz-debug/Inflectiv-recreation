import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { supabaseAdmin } from '@/server/supabase';

// Initialize LangChain with Gemini
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

interface GenerateOptions {
  format: 'structured' | 'narrative' | 'tabular';
  length: 'brief' | 'standard' | 'comprehensive';
}

// Get word count target based on length option
function getWordCountTarget(length: GenerateOptions['length']): number {
  switch (length) {
    case 'brief':
      return 500;
    case 'standard':
      return 2000;
    case 'comprehensive':
      return 5000;
    default:
      return 2000;
  }
}

// Get format instructions
function getFormatInstructions(format: GenerateOptions['format']): string {
  switch (format) {
    case 'structured':
      return 'Format the data as structured key-value pairs, lists, and categorized entities. Use clear hierarchies and relationships.';
    case 'narrative':
      return 'Format the data as detailed narrative paragraphs with rich descriptions, analysis, and context.';
    case 'tabular':
      return 'Format the data in a tabular structure with clear columns, rows, and data points that could be converted to a spreadsheet.';
    default:
      return 'Format the data in a clear, organized structure.';
  }
}

// Generate dataset content
async function generateDatasetContent(
  prompt: string,
  options: GenerateOptions
): Promise<string> {
  const wordCount = getWordCountTarget(options.length);
  const formatInstructions = getFormatInstructions(options.format);

  const generationPrompt = `You are a data generation expert. Based on the user's request, generate a comprehensive, realistic, and valuable dataset.

## User Request:
${prompt}

## Requirements:
- Target approximately ${wordCount} words
- ${formatInstructions}
- Include realistic, plausible data points
- Ensure data consistency and coherence
- Add relevant metadata and context
- Make the data valuable for analysis and insights

Generate the dataset now:`;

  const response = await model.invoke([
    new SystemMessage(
      'You are an expert data scientist and researcher. Generate high-quality, realistic datasets based on user descriptions. Your data should be comprehensive, well-structured, and valuable for analysis.'
    ),
    new HumanMessage(generationPrompt),
  ]);

  return typeof response.content === 'string'
    ? response.content
    : JSON.stringify(response.content);
}

// Structure the generated content
async function structureGeneratedData(
  prompt: string,
  generatedContent: string,
  options: GenerateOptions
): Promise<Record<string, unknown>> {
  const structuringPrompt = `Analyze this AI-generated dataset and create marketplace metadata.

Original Request: ${prompt}
Format: ${options.format}
Length: ${options.length}

Generated Content:
${generatedContent}

Return ONLY valid JSON:
{
  "generatedName": "Marketable name for this dataset (max 60 chars)",
  "generatedDescription": "2-3 sentence compelling marketplace description",
  "title": "Dataset title",
  "summary": "Summary of what this dataset contains",
  "entities": {
    "people": ["Person names if any"],
    "organizations": ["Organizations if any"],
    "locations": ["Locations if any"],
    "dates": ["Time periods covered"],
    "concepts": ["Main concepts and themes"]
  },
  "sentiment": {
    "overall": "neutral",
    "confidence": 0.8,
    "explanation": "AI-generated content, neutral tone"
  },
  "keywords": ["10-15 relevant keywords"],
  "category": "Best category (financial, legal, technical, medical, research, business, general)",
  "language": "English",
  "wordCount": ${generatedContent.split(/\s+/).length},
  "metadata": {
    "documentType": "ai-generated",
    "complexity": "${options.length === 'comprehensive' ? 'high' : options.length === 'brief' ? 'low' : 'medium'}",
    "format": "${options.format}",
    "actionItems": ["Potential use cases for this data"]
  },
  "generatedContent": "Include the full generated content here"
}`;

  const response = await model.invoke([
    new SystemMessage('You are a data analyst. Structure the provided content into marketplace-ready metadata. Return only valid JSON.'),
    new HumanMessage(structuringPrompt),
  ]);

  const responseText = typeof response.content === 'string'
    ? response.content
    : JSON.stringify(response.content);

  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    // Ensure generatedContent is included
    if (!parsed.generatedContent) {
      parsed.generatedContent = generatedContent;
    }
    return parsed;
  } catch {
    return {
      generatedName: 'AI-Generated Dataset',
      generatedDescription: 'A custom dataset generated by AI based on your specifications.',
      title: 'AI-Generated Data',
      summary: prompt,
      entities: { people: [], organizations: [], locations: [], dates: [], concepts: [] },
      sentiment: { overall: 'neutral', confidence: 0.8, explanation: 'AI-generated content' },
      keywords: prompt.split(' ').slice(0, 10),
      category: 'general',
      language: 'English',
      wordCount: generatedContent.split(/\s+/).length,
      metadata: {
        documentType: 'ai-generated',
        complexity: options.length === 'comprehensive' ? 'high' : 'medium',
        format: options.format,
        actionItems: [],
      },
      generatedContent,
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
    const { userId, prompt, options } = body as {
      userId: string;
      prompt: string;
      options: GenerateOptions;
    };

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a more detailed prompt (at least 10 characters)' },
        { status: 400 }
      );
    }

    // Generate the dataset content
    const generatedContent = await generateDatasetContent(prompt, options);

    // Structure the data for the marketplace
    const structuredData = await structureGeneratedData(prompt, generatedContent, options);

    // Generate token ID
    const tokenId = `INFL-${Date.now().toString(36).toUpperCase()}`;

    // Store in database
    const { data: asset, error: dbError } = await supabaseAdmin
      .from('assets')
      .insert({
        user_id: userId,
        token_id: tokenId,
        name: (structuredData.generatedName as string) || 'AI-Generated Dataset',
        description: (structuredData.generatedDescription as string) || null,
        category: (structuredData.category as string) || 'general',
        tags: (structuredData.keywords as string[]) || [],
        structured_data: structuredData,
        original_filename: `ai-generated-${options.format}-${options.length}`,
        file_type: 'ai-generated',
        file_size: generatedContent.length,
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
      processedAt: new Date().toISOString(),
      generatedName: structuredData.generatedName,
      generatedDescription: structuredData.generatedDescription,
      category: structuredData.category,
      wordCount: structuredData.wordCount,
      format: options.format,
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: `Failed to generate dataset: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
