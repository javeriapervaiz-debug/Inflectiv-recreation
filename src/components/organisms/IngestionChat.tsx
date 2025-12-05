'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Upload, Globe, Database, ArrowLeft } from 'lucide-react';
import { BrowserProvider } from 'ethers';
import {
  ChatMessage,
  TypingIndicator,
  AssetInfoCard,
  DataSourceSelector,
  FileUploadPanel,
  WebSourcePanel,
  AIGeneratePanel,
  BlendSourcesPanel,
} from '@/components/molecules';
import type { DataSourceType } from '@/components/molecules';
import type { ChatMessage as ChatMessageType, ChatResponse, ConversationMessage } from '@/types';
import { useWeb3Auth } from '@/lib/web3auth';
import { type MintResult } from '@/lib/contracts';

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const INITIAL_MESSAGE: ChatMessageType = {
  id: 'initial',
  role: 'agent',
  content: 'Welcome to Inflectiv! I can help you create powerful data assets.\n\nChoose how you want to create your dataset, or ask me questions about your existing data.',
  timestamp: new Date(),
};

interface EditingAsset {
  id: string;
  name: string;
  description: string;
  tokenId: string;
}

interface IngestionChatProps {
  userId?: string;
  editingAsset?: EditingAsset;
}

type ViewMode = 'chat' | 'source-select' | 'files' | 'web' | 'ai' | 'blend';

interface IngestResponse {
  success: boolean;
  assetId: string;
  tokenId: string;
  generatedName: string;
  generatedDescription: string;
  category: string;
  error?: string;
  filesProcessed?: number;
  filenames?: string[];
  sourcesProcessed?: number;
  sourceBreakdown?: {
    files: number;
    webSources: number;
    aiEnhanced: boolean;
  };
}

export function IngestionChat({ userId, editingAsset }: IngestionChatProps) {
  // Create initial message based on whether we're editing an existing asset
  const getInitialMessages = (): ChatMessageType[] => {
    if (editingAsset) {
      return [
        {
          id: 'initial',
          role: 'agent',
          content: `I'm ready to help you edit "${editingAsset.name}".\n\n${editingAsset.description ? `Current description: ${editingAsset.description}\n\n` : ''}You can:\n• Upload new files to add more data\n• Ask questions about this dataset\n• Modify the dataset structure\n\nWhat would you like to change?`,
          timestamp: new Date(),
        },
      ];
    }
    return [INITIAL_MESSAGE];
  };

  const [messages, setMessages] = useState<ChatMessageType[]>(getInitialMessages());
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Processing...');
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [selectedSource, setSelectedSource] = useState<DataSourceType | null>(null);
  const [walletProvider, setWalletProvider] = useState<BrowserProvider | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get wallet context for minting
  const { user, getProvider } = useWeb3Auth();

  // Reset messages when editingAsset changes
  useEffect(() => {
    setMessages(getInitialMessages());
    setConversationHistory([]);
  }, [editingAsset?.id]);

  // Initialize wallet provider
  useEffect(() => {
    const initProvider = async () => {
      if (user) {
        const provider = await getProvider();
        setWalletProvider(provider);
      } else {
        setWalletProvider(null);
      }
    };
    initProvider();
  }, [user, getProvider]);

  // Handle mint success - update Supabase with blockchain token ID
  const handleMintSuccess = useCallback(async (result: MintResult, assetId: string) => {
    if (!result.tokenId) return;

    try {
      // Call API to update asset with blockchain token ID
      await fetch('/api/assets/update-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId,
          blockchainTokenId: result.tokenId.toString(),
          accessTokenAddress: result.accessTokenAddress,
          transactionHash: result.transactionHash,
        }),
      });
    } catch (error) {
      console.error('Failed to update asset with mint info:', error);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing, scrollToBottom]);

  const addMessage = useCallback((message: Omit<ChatMessageType, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessageType = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  // Handle source selection
  const handleSourceSelect = (source: DataSourceType) => {
    setSelectedSource(source);
    setViewMode(source);
  };

  // Handle back to chat
  const handleBackToChat = () => {
    setViewMode('chat');
    setSelectedSource(null);
  };

  // Handle multiple file upload
  const handleFilesReady = async (files: File[]) => {
    if (!userId) return;

    setIsProcessing(true);
    setProcessingStatus('Uploading files...');

    addMessage({
      role: 'user',
      content: `Uploading ${files.length} file${files.length > 1 ? 's' : ''}: ${files.map((f) => f.name).join(', ')}`,
    });

    addMessage({
      role: 'agent',
      content: `Processing ${files.length} file${files.length > 1 ? 's' : ''}. This may take a moment...`,
    });

    setViewMode('chat');

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      setProcessingStatus('Extracting content...');

      const response = await fetch('/api/ingest/batch', {
        method: 'POST',
        body: formData,
      });

      setProcessingStatus('Analyzing with AI...');

      const data: IngestResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to process files');
      }

      addMessage({
        role: 'agent',
        content: `Successfully processed ${data.filesProcessed} file${(data.filesProcessed || 0) > 1 ? 's' : ''}! Your dataset is ready.`,
        assetInfo: {
          assetId: data.assetId,
          tokenId: data.tokenId,
          generatedName: data.generatedName,
          generatedDescription: data.generatedDescription,
          category: data.category,
        },
      });
    } catch (error) {
      addMessage({
        role: 'agent',
        content: `Error processing files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsProcessing(false);
      setSelectedSource(null);
    }
  };

  // Handle web sources
  const handleWebSourcesReady = async (sources: { id: string; type: 'url' | 'search'; value: string }[]) => {
    if (!userId) return;

    setIsProcessing(true);
    setProcessingStatus('Fetching web data...');

    addMessage({
      role: 'user',
      content: `Processing ${sources.length} web source${sources.length > 1 ? 's' : ''}`,
    });

    addMessage({
      role: 'agent',
      content: 'Extracting data from web sources. This may take a moment...',
    });

    setViewMode('chat');

    try {
      setProcessingStatus('Analyzing content...');

      const response = await fetch('/api/ingest/web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sources: sources.map((s) => ({ type: s.type, value: s.value })),
        }),
      });

      const data: IngestResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to process web sources');
      }

      addMessage({
        role: 'agent',
        content: `Successfully extracted data from ${data.sourcesProcessed} web source${(data.sourcesProcessed || 0) > 1 ? 's' : ''}!`,
        assetInfo: {
          assetId: data.assetId,
          tokenId: data.tokenId,
          generatedName: data.generatedName,
          generatedDescription: data.generatedDescription,
          category: data.category,
        },
      });
    } catch (error) {
      addMessage({
        role: 'agent',
        content: `Error processing web sources: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsProcessing(false);
      setSelectedSource(null);
    }
  };

  // Handle AI generation
  const handleAIGenerate = async (prompt: string, options: { format: string; length: string }) => {
    if (!userId) return;

    setIsProcessing(true);
    setProcessingStatus('Generating dataset...');

    addMessage({
      role: 'user',
      content: `Generate dataset: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`,
    });

    addMessage({
      role: 'agent',
      content: 'Creating your AI-generated dataset. This may take a moment...',
    });

    setViewMode('chat');

    try {
      setProcessingStatus('AI is thinking...');

      const response = await fetch('/api/ingest/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, prompt, options }),
      });

      const data: IngestResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate dataset');
      }

      addMessage({
        role: 'agent',
        content: 'Your AI-generated dataset is ready!',
        assetInfo: {
          assetId: data.assetId,
          tokenId: data.tokenId,
          generatedName: data.generatedName,
          generatedDescription: data.generatedDescription,
          category: data.category,
        },
      });
    } catch (error) {
      addMessage({
        role: 'agent',
        content: `Error generating dataset: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsProcessing(false);
      setSelectedSource(null);
    }
  };

  // Handle blended sources
  const handleBlendedSourcesReady = async (sources: {
    files: File[];
    urls: string[];
    searchQueries: string[];
    aiPrompt: string;
  }) => {
    if (!userId) return;

    setIsProcessing(true);
    setProcessingStatus('Blending sources...');

    const sourceCount =
      sources.files.length +
      sources.urls.length +
      sources.searchQueries.length +
      (sources.aiPrompt ? 1 : 0);

    addMessage({
      role: 'user',
      content: `Blending ${sourceCount} sources together`,
    });

    addMessage({
      role: 'agent',
      content: 'Combining all your sources into a comprehensive dataset...',
    });

    setViewMode('chat');

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('urls', JSON.stringify(sources.urls));
      formData.append('searchQueries', JSON.stringify(sources.searchQueries));
      formData.append('aiPrompt', sources.aiPrompt);

      sources.files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      setProcessingStatus('Processing all sources...');

      const response = await fetch('/api/ingest/blend', {
        method: 'POST',
        body: formData,
      });

      const data: IngestResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to blend sources');
      }

      const breakdown = data.sourceBreakdown;
      const parts = [];
      if (breakdown?.files) parts.push(`${breakdown.files} file${breakdown.files > 1 ? 's' : ''}`);
      if (breakdown?.webSources) parts.push(`${breakdown.webSources} web source${breakdown.webSources > 1 ? 's' : ''}`);
      if (breakdown?.aiEnhanced) parts.push('AI enhancement');

      addMessage({
        role: 'agent',
        content: `Successfully blended ${parts.join(', ')} into a comprehensive dataset!`,
        assetInfo: {
          assetId: data.assetId,
          tokenId: data.tokenId,
          generatedName: data.generatedName,
          generatedDescription: data.generatedDescription,
          category: data.category,
        },
      });
    } catch (error) {
      addMessage({
        role: 'agent',
        content: `Error blending sources: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsProcessing(false);
      setSelectedSource(null);
    }
  };

  // Handle text message submission (Q&A)
  const handleSendMessage = async (e?: FormEvent) => {
    e?.preventDefault();

    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isProcessing) return;

    if (!userId) {
      addMessage({
        role: 'agent',
        content: 'Please wait while your session is being initialized...',
      });
      return;
    }

    addMessage({ role: 'user', content: trimmedMessage });
    setInputValue('');

    const newHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: 'user', content: trimmedMessage },
    ];

    setIsProcessing(true);
    setProcessingStatus('Thinking...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedMessage,
          userId,
          conversationHistory,
          editingAsset: editingAsset ? {
            id: editingAsset.id,
            name: editingAsset.name,
            description: editingAsset.description,
            tokenId: editingAsset.tokenId,
          } : undefined,
        }),
      });

      const data: ChatResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      addMessage({ role: 'agent', content: data.response });

      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: data.response },
      ]);
    } catch (error) {
      addMessage({
        role: 'agent',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  // Render the appropriate panel based on view mode
  const renderPanel = () => {
    switch (viewMode) {
      case 'source-select':
        return (
          <div className="p-5">
            <DataSourceSelector onSelect={handleSourceSelect} selectedSource={selectedSource} />
          </div>
        );
      case 'files':
        return (
          <div className="p-5">
            <FileUploadPanel
              onFilesReady={handleFilesReady}
              onBack={handleBackToChat}
              isProcessing={isProcessing}
            />
          </div>
        );
      case 'web':
        return (
          <div className="p-5">
            <WebSourcePanel
              onSourcesReady={handleWebSourcesReady}
              onBack={handleBackToChat}
              isProcessing={isProcessing}
            />
          </div>
        );
      case 'ai':
        return (
          <div className="p-5">
            <AIGeneratePanel
              onGenerate={handleAIGenerate}
              onBack={handleBackToChat}
              isProcessing={isProcessing}
            />
          </div>
        );
      case 'blend':
        return (
          <div className="p-5">
            <BlendSourcesPanel
              onSourcesReady={handleBlendedSourcesReady}
              onBack={handleBackToChat}
              isProcessing={isProcessing}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] overflow-hidden">
      {/* Title Bar */}
      <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {viewMode !== 'chat' && (
            <button
              onClick={handleBackToChat}
              className="w-6 h-5 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center text-sm font-bold hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]"
            >
              <ArrowLeft className="w-4 h-4 text-[#000080]" />
            </button>
          )}
          <span className="text-xl">💾</span>
          <span className="text-white text-base font-bold tracking-wide">Inflectiv Agent v2.0</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Database className="w-4 h-4" />
            <span>Q&A</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Globe className="w-4 h-4" />
            <span>Web</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 bg-[#7fff9f] shadow-[0_0_8px_#7fff9f] animate-pulse" />
            <span className="text-[#7fff9f] font-semibold">ONLINE</span>
          </div>
          <div className="flex gap-1">
            <button className="w-5 h-4 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center text-sm font-bold">
              _
            </button>
            <button className="w-5 h-4 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center text-sm font-bold">
              □
            </button>
            <button className="w-5 h-4 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center text-sm font-bold">
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="bg-[#c3c3c3] border-b border-[#808080] px-3 py-1.5 flex items-center gap-6">
        <span className="text-[#000080] text-base font-medium hover:bg-[#000080] hover:text-white px-2 py-0.5 cursor-pointer transition-colors">File</span>
        <span className="text-[#000080] text-base font-medium hover:bg-[#000080] hover:text-white px-2 py-0.5 cursor-pointer transition-colors">Edit</span>
        <span className="text-[#000080] text-base font-medium hover:bg-[#000080] hover:text-white px-2 py-0.5 cursor-pointer transition-colors">View</span>
        <span className="text-[#000080] text-base font-medium hover:bg-[#000080] hover:text-white px-2 py-0.5 cursor-pointer transition-colors">Help</span>
      </div>

      {/* Content Area */}
      {viewMode === 'chat' ? (
        <>
          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto bg-gradient-to-b from-[#008b8b] to-[#006b6b]"
          >
            <div className="py-4 px-2">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatMessage message={message}>
                      {message.assetInfo && (
                        <AssetInfoCard
                          assetId={message.assetInfo.assetId}
                          generatedName={message.assetInfo.generatedName}
                          generatedDescription={message.assetInfo.generatedDescription}
                          category={message.assetInfo.category}
                          tokenId={message.assetInfo.tokenId}
                          filename=""
                          provider={walletProvider}
                          walletAddress={user?.walletAddress}
                          onMintSuccess={(result) => handleMintSuccess(result, message.assetInfo!.assetId)}
                        />
                      )}
                    </ChatMessage>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <TypingIndicator message={processingStatus} />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-[#c3c3c3] border-t-2 border-[#dfdfdf] p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('source-select')}
                disabled={isProcessing || !userId}
                className="px-4 py-3 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold text-base hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf] disabled:opacity-50 flex items-center gap-2 transition-all"
              >
                <Upload className="w-5 h-5" />
                New
              </button>

              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    !userId
                      ? 'Initializing session...'
                      : 'Ask about your data or click New to add data...'
                  }
                  disabled={isProcessing || !userId}
                  className="w-full px-4 py-3 bg-white text-[#000080] text-base placeholder:text-[#808080] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff,inset_2px_2px_#404040] focus:outline-none focus:ring-2 focus:ring-[#000080] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || !userId || !inputValue.trim()}
                className={`px-5 py-3 font-bold text-base shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf] disabled:opacity-50 flex items-center gap-2 transition-all ${
                  !isProcessing && userId && inputValue.trim()
                    ? 'bg-[#7fff9f] text-[#000080] hover:bg-[#5fff8f]'
                    : 'bg-[#c3c3c3] text-[#808080]'
                }`}
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </form>

            {/* Status Bar */}
            <div className="mt-3 flex items-center gap-4 text-sm text-[#000080]">
              <div className="flex-1 px-3 py-1.5 bg-[#c3c3c3] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] font-medium">
                {isProcessing ? processingStatus : 'Ready'}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#c3c3c3] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff]">
                <Upload className="w-4 h-4" />
                <span>Files, Web, AI, or Blend</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#c3c3c3] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff]">
                <Sparkles className="w-4 h-4" />
                <span>Dataset Q&A</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#008b8b] to-[#006b6b]">{renderPanel()}</div>
      )}
    </div>
  );
}
