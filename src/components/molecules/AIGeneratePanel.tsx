'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIGeneratePanelProps {
  onGenerate: (prompt: string, options: GenerateOptions) => void;
  onBack: () => void;
  isProcessing: boolean;
}

interface GenerateOptions {
  format: 'structured' | 'narrative' | 'tabular';
  length: 'brief' | 'standard' | 'comprehensive';
}

const promptExamples = [
  'Top 100 tech startups founded in 2024 with funding and location',
  'Customer sentiment analysis data for e-commerce returns',
  'Historical cryptocurrency price trends for major coins',
  'Environmental sustainability metrics for Fortune 500',
];

const formatOptions = [
  { id: 'structured', label: 'Structured', desc: 'Key-value pairs' },
  { id: 'narrative', label: 'Narrative', desc: 'Detailed text' },
  { id: 'tabular', label: 'Tabular', desc: 'Table format' },
] as const;

const lengthOptions = [
  { id: 'brief', label: 'Brief', desc: '~500 words' },
  { id: 'standard', label: 'Standard', desc: '~2000 words' },
  { id: 'comprehensive', label: 'Full', desc: '~5000 words' },
] as const;

export function AIGeneratePanel({ onGenerate, onBack, isProcessing }: AIGeneratePanelProps) {
  const [prompt, setPrompt] = useState('');
  const [format, setFormat] = useState<GenerateOptions['format']>('structured');
  const [length, setLength] = useState<GenerateOptions['length']>('standard');

  const handleSubmit = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim(), { format, length });
    }
  };

  const useExample = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="w-full max-w-2xl mx-auto font-['VT323',monospace]">
      {/* Window Frame */}
      <div className="bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#fffb96]" />
            <span className="text-white text-sm font-bold tracking-wide">AI Dataset Generator</span>
          </div>
          <div className="flex gap-1">
            <button className="w-4 h-3.5 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center text-[10px] font-bold">
              _
            </button>
            <button className="w-4 h-3.5 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center text-[10px] font-bold">
              □
            </button>
            <button className="w-4 h-3.5 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center text-[10px] font-bold">
              ×
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 bg-[#008080]">
          <div className="text-center mb-4">
            <h2 className="text-xl text-white drop-shadow-[2px_2px_#000080] tracking-wider">
              ✨ Generate Dataset with AI
            </h2>
            <p className="text-[#fffb96] text-sm mt-1">
              Describe the dataset and let AI create it
            </p>
          </div>

          {/* Prompt Input */}
          <div className="mb-4">
            <div className="bg-[#c0c0c0] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] p-1 mb-2">
              <span className="text-[#000080] text-sm font-bold px-2">
                Describe your dataset:
              </span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A comprehensive dataset of renewable energy projects worldwide..."
              rows={4}
              className="w-full px-3 py-2 bg-white text-[#000080] placeholder:text-[#808080] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff,inset_2px_2px_#404040] focus:outline-none focus:ring-2 focus:ring-[#000080] resize-none"
            />
          </div>

          {/* Example Prompts */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-[#fffb96]" />
              <span className="text-[#fffb96] text-sm font-bold">Example prompts:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {promptExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => useExample(example)}
                  className="text-xs px-2 py-1 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf] truncate max-w-[200px]"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Format Selection */}
            <div>
              <div className="bg-[#c0c0c0] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] p-1 mb-2">
                <span className="text-[#000080] text-xs font-bold px-2">Output Format:</span>
              </div>
              <div className="space-y-1">
                {formatOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormat(option.id)}
                    className={cn(
                      'w-full flex items-center gap-2 p-2 text-left text-sm',
                      'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                      format === option.id
                        ? 'bg-[#000080] text-white shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]'
                        : 'bg-[#c0c0c0] text-[#000080] hover:bg-[#dfdfdf]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-3 h-3 border-2 rounded-full',
                        format === option.id
                          ? 'border-[#05ffa1] bg-[#05ffa1]'
                          : 'border-[#808080] bg-white'
                      )}
                    />
                    <div>
                      <span className="font-bold">{option.label}</span>
                      <span className="ml-2 opacity-70 text-xs">({option.desc})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Length Selection */}
            <div>
              <div className="bg-[#c0c0c0] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] p-1 mb-2">
                <span className="text-[#000080] text-xs font-bold px-2">Dataset Size:</span>
              </div>
              <div className="space-y-1">
                {lengthOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setLength(option.id)}
                    className={cn(
                      'w-full flex items-center gap-2 p-2 text-left text-sm',
                      'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                      length === option.id
                        ? 'bg-[#000080] text-white shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]'
                        : 'bg-[#c0c0c0] text-[#000080] hover:bg-[#dfdfdf]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-3 h-3 border-2 rounded-full',
                        length === option.id
                          ? 'border-[#ff71ce] bg-[#ff71ce]'
                          : 'border-[#808080] bg-white'
                      )}
                    />
                    <div>
                      <span className="font-bold">{option.label}</span>
                      <span className="ml-2 opacity-70 text-xs">({option.desc})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar / Actions */}
        <div className="bg-[#c0c0c0] border-t-2 border-[#dfdfdf] p-2 flex items-center justify-between">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="px-4 py-1 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold text-sm hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf] disabled:opacity-50"
          >
            ◀ Back
          </button>

          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-[#c0c0c0] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] text-xs text-[#000080]">
              {format} / {length}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isProcessing}
              className={cn(
                'px-4 py-1 font-bold text-sm',
                'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                'active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]',
                'disabled:opacity-50',
                prompt.trim() && !isProcessing
                  ? 'bg-[#b967ff] text-white hover:bg-[#c77fff]'
                  : 'bg-[#c0c0c0] text-[#808080]'
              )}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate ▶
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
