'use client';

import { Bot, User, FileText, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
  children?: React.ReactNode;
}

export function ChatMessage({ message, children }: ChatMessageProps) {
  const isAgent = message.role === 'agent';

  return (
    <div
      className={cn(
        'flex gap-3 p-3 font-["VT323",monospace]',
        isAgent ? 'justify-start' : 'justify-end'
      )}
    >
      {isAgent && (
        <div className="flex-shrink-0 w-12 h-12 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center">
          <span className="text-2xl">🤖</span>
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%]',
          isAgent
            ? 'bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]'
            : 'bg-[#000080] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]'
        )}
      >
        {/* Message Title Bar */}
        <div
          className={cn(
            'px-3 py-1 flex items-center gap-2',
            isAgent
              ? 'bg-gradient-to-r from-[#000080] to-[#1084d0]'
              : 'bg-gradient-to-r from-[#008080] to-[#00a0a0]'
          )}
        >
          {isAgent ? (
            <Bot className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
          <span className="text-white text-sm font-bold">
            {isAgent ? 'INFLECTIV.AI' : 'YOU'}
          </span>
          <span className="ml-auto text-white/90 text-xs">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className={cn('p-4', isAgent ? 'bg-white' : 'bg-[#008080]')}>
          {message.file && (
            <div
              className={cn(
                'flex items-center gap-2 mb-3 text-base p-2',
                isAgent
                  ? 'bg-[#fffb96]/30 border-2 border-[#000080]'
                  : 'bg-[#000080]/30 border-2 border-[#01cdfe]'
              )}
            >
              <FileText className={cn('w-5 h-5', isAgent ? 'text-[#000080]' : 'text-[#01cdfe]')} />
              <span className={cn('font-bold text-base', isAgent ? 'text-[#000080]' : 'text-white')}>
                {message.file.name}
              </span>
              <span className={cn('text-sm', isAgent ? 'text-[#404040]' : 'text-[#fffb96]')}>
                ({(message.file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}

          <div
            className={cn(
              'text-base leading-relaxed',
              isAgent
                ? 'text-[#000000] prose prose-base max-w-none prose-headings:text-[#000000] prose-strong:text-[#000000] prose-p:text-[#000000] prose-li:text-[#000000] prose-code:text-[#8b008b] prose-code:bg-[#000080]/10 prose-code:px-1 prose-code:py-0.5 prose-pre:bg-[#000080]/10 prose-pre:border prose-pre:border-[#000080] prose-a:text-[#0000cd] prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5'
                : 'text-white'
            )}
          >
            {isAgent ? (
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0 text-[#000000] text-base">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-[#000000] text-base">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold text-[#000000]">{children}</strong>,
                  em: ({ children }) => <em className="italic text-[#404040]">{children}</em>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="text-[#8b008b] bg-[#000080]/10 px-1.5 py-0.5 text-sm font-mono border border-[#000080]/30">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-[#000080]/10 border-2 border-[#000080] p-3 overflow-x-auto my-3 shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] text-sm">
                      {children}
                    </pre>
                  ),
                  h1: ({ children }) => <h1 className="text-xl font-bold text-[#000000] mb-3 border-b-2 border-[#000080] pb-1">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold text-[#000000] mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-bold text-[#000000] mb-2">{children}</h3>,
                  a: ({ href, children }) => (
                    <a href={href} className="text-[#0000cd] hover:text-[#ff00ff] underline font-bold" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[#8b008b] pl-3 italic text-[#404040] my-3 bg-[#8b008b]/10 py-2">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <p className="text-white text-base font-bold drop-shadow-[1px_1px_#000080]">{message.content}</p>
            )}
          </div>

          {message.status === 'error' && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-[#ff0000]/20 border-2 border-[#ff0000]">
              <AlertCircle className="w-5 h-5 text-[#ff0000]" />
              <span className="text-[#ff0000] text-base font-bold">ERROR: Failed to send</span>
            </div>
          )}

          {children}
        </div>
      </div>

      {!isAgent && (
        <div className="flex-shrink-0 w-12 h-12 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </div>
      )}
    </div>
  );
}
