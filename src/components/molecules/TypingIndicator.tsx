'use client';

import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  message?: string;
}

export function TypingIndicator({ message = 'Processing...' }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 p-3 font-['VT323',monospace]">
      <div className="flex-shrink-0 w-12 h-12 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center animate-pulse">
        <span className="text-2xl">🤖</span>
      </div>

      <div className="bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-3 py-1 flex items-center gap-2">
          <Bot className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-bold">INFLECTIV.AI</span>
        </div>

        <div className="p-4 bg-white">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <span
                className="w-4 h-4 bg-[#05ffa1] animate-bounce shadow-[0_0_8px_#05ffa1]"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-4 h-4 bg-[#01cdfe] animate-bounce shadow-[0_0_8px_#01cdfe]"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-4 h-4 bg-[#b967ff] animate-bounce shadow-[0_0_8px_#b967ff]"
                style={{ animationDelay: '300ms' }}
              />
            </div>
            <span className="text-base text-[#000000] font-bold">{message}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
