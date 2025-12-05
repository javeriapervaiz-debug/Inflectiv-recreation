// Chat message types
export type MessageRole = 'user' | 'agent';
export type MessageStatus = 'sending' | 'sent' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  file?: {
    name: string;
    size: number;
    type: string;
  };
  structuredData?: StructuredData;
  // Asset info for display after ingestion
  assetInfo?: {
    assetId: string;
    tokenId: string;
    generatedName: string;
    generatedDescription: string;
    category: string;
  };
}

// API response types
export interface StructuredData {
  title: string;
  summary: string;
  entities: {
    people: string[];
    organizations: string[];
    locations: string[];
    dates: string[];
    concepts: string[];
  };
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral' | 'mixed';
    confidence: number;
    explanation: string;
  };
  keywords: string[];
  category: string;
  language: string;
  wordCount: number;
  metadata: {
    documentType: string;
    complexity: 'low' | 'medium' | 'high';
    actionItems: string[];
  };
}

// Updated API response for simplified ingestion
export interface IngestResponse {
  success: boolean;
  assetId: string;
  tokenId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  processedAt: string;
  generatedName: string;
  generatedDescription: string;
  category: string;
  error?: string;
}

// Chat API response
export interface ChatResponse {
  success: boolean;
  response: string;
  hasWebSearch: boolean;
  datasetsUsed: number;
  error?: string;
}

// Conversation history for API
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}
