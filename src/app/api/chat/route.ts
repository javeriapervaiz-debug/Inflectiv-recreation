import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { supabaseAdmin } from '@/server/supabase';

// Initialize LangChain with Gemini (using grounding for web search)
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

// System prompt for the chat assistant
const SYSTEM_PROMPT = `You are an intelligent Data Analysis Assistant for Inflectiv, a Web3 data marketplace platform. Your role is to help users understand, analyze, and extract insights from their uploaded datasets.

## Your Capabilities:
1. **Dataset Analysis**: Answer questions about uploaded datasets, explain patterns, summarize content, and provide insights.
2. **Research & References**: When needed, you can search the web to provide additional context, references, and current information to enhance your answers.
3. **Data Interpretation**: Help users understand what their data means, identify trends, and suggest potential use cases.
4. **Marketplace Guidance**: Advise on how to best position and describe data assets for the marketplace.

## Guidelines:
- Always be helpful, accurate, and concise
- When referencing the dataset, cite specific entities, keywords, or sections when possible
- If you perform web research, clearly indicate which information comes from external sources and provide references
- If you're unsure about something in the dataset, say so rather than guessing
- Format responses clearly using markdown when helpful

## Context:
You have access to the user's uploaded datasets and their structured data. Use this information to provide accurate, data-driven responses.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DatasetContext {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  structured_data: Record<string, unknown>;
  original_filename: string | null;
}

// Fetch user's datasets for context
async function getUserDatasets(userId: string): Promise<DatasetContext[]> {
  const { data, error } = await supabaseAdmin
    .from('assets')
    .select('id, name, description, category, structured_data, original_filename')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5); // Get 5 most recent datasets for context

  if (error) {
    console.error('Error fetching user datasets:', error);
    return [];
  }

  return (data || []) as DatasetContext[];
}

// Format dataset context for the AI
function formatDatasetContext(datasets: DatasetContext[]): string {
  if (datasets.length === 0) {
    return 'No datasets have been uploaded yet.';
  }

  return datasets.map((dataset, index) => {
    const structuredData = dataset.structured_data || {};
    return `
### Dataset ${index + 1}: ${dataset.name}
- **File**: ${dataset.original_filename || 'Unknown'}
- **Category**: ${dataset.category || 'General'}
- **Description**: ${dataset.description || 'No description'}
- **Summary**: ${(structuredData as Record<string, unknown>).summary || 'No summary available'}
- **Keywords**: ${((structuredData as Record<string, unknown>).keywords as string[])?.join(', ') || 'None'}
- **Entities**:
  - People: ${((structuredData as Record<string, { people?: string[] }>).entities?.people as string[])?.join(', ') || 'None'}
  - Organizations: ${((structuredData as Record<string, { organizations?: string[] }>).entities?.organizations as string[])?.join(', ') || 'None'}
  - Locations: ${((structuredData as Record<string, { locations?: string[] }>).entities?.locations as string[])?.join(', ') || 'None'}
  - Concepts: ${((structuredData as Record<string, { concepts?: string[] }>).entities?.concepts as string[])?.join(', ') || 'None'}
- **Sentiment**: ${(structuredData as Record<string, { overall?: string }>).sentiment?.overall || 'Unknown'} (${(structuredData as Record<string, { explanation?: string }>).sentiment?.explanation || 'No explanation'})
- **Document Type**: ${(structuredData as Record<string, { documentType?: string }>).metadata?.documentType || 'Unknown'}
- **Complexity**: ${(structuredData as Record<string, { complexity?: string }>).metadata?.complexity || 'Unknown'}
`;
  }).join('\n---\n');
}

// Web search using Google Custom Search API (optional enhancement)
async function performWebSearch(query: string): Promise<string | null> {
  // For now, we rely on Gemini's training data for general knowledge
  // Web search can be added later with Google Custom Search API or similar
  // The AI can still provide research-backed responses from its training
  return null;
}

// Determine if web search is needed based on the question
function shouldSearchWeb(question: string): boolean {
  const searchIndicators = [
    'latest', 'current', 'recent', 'news', 'today',
    'compare with', 'industry standard', 'benchmark',
    'what is', 'who is', 'explain', 'define',
    'market', 'trend', 'statistics', 'research',
    'reference', 'source', 'according to'
  ];

  const lowerQuestion = question.toLowerCase();
  return searchIndicators.some(indicator => lowerQuestion.includes(indicator));
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, userId, conversationHistory = [] } = body as {
      message: string;
      userId: string;
      conversationHistory: ChatMessage[];
    };

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Fetch user's datasets for context
    const datasets = await getUserDatasets(userId);
    const datasetContext = formatDatasetContext(datasets);

    // Check if we should perform web search (currently disabled, using Gemini's knowledge)
    let webSearchResults: string | null = null;
    if (shouldSearchWeb(message)) {
      webSearchResults = await performWebSearch(message);
    }

    // Build the full system context
    let fullSystemPrompt = SYSTEM_PROMPT;
    fullSystemPrompt += `\n\n## User's Uploaded Datasets:\n${datasetContext}`;

    if (webSearchResults) {
      fullSystemPrompt += `\n\n## Web Research Results (use to supplement your answer, cite sources):\n${webSearchResults}`;
    }

    // Build message history
    const messages = [
      new SystemMessage(fullSystemPrompt),
      ...conversationHistory.map(msg =>
        msg.role === 'user'
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      ),
      new HumanMessage(message),
    ];

    // Get AI response
    const response = await model.invoke(messages);
    const responseText = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);

    return NextResponse.json({
      success: true,
      response: responseText,
      hasWebSearch: !!webSearchResults,
      datasetsUsed: datasets.length,
    });

  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: `Failed to process message: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Inflectiv Chat API',
    features: ['dataset-analysis', 'ai-knowledge', 'conversation-history'],
    version: '1.0.0',
  });
}
