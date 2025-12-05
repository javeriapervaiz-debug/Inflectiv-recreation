'use client';

import { Upload, Globe, Sparkles, Blend } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DataSourceType = 'files' | 'web' | 'ai' | 'blend';

interface DataSourceOption {
  id: DataSourceType;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  emoji: string;
}

const dataSourceOptions: DataSourceOption[] = [
  {
    id: 'files',
    icon: Upload,
    title: 'Use Your Data',
    description: 'Upload files (PDF, CSV, TXT, MD) to be structured and enriched.',
    color: '#05ffa1',
    emoji: '📁',
  },
  {
    id: 'web',
    icon: Globe,
    title: 'Use the Web',
    description: 'Enter URL or search topic to extract data from the internet.',
    color: '#01cdfe',
    emoji: '🌐',
  },
  {
    id: 'ai',
    icon: Sparkles,
    title: 'Generate with AI',
    description: 'Create a brand new dataset from a text description.',
    color: '#b967ff',
    emoji: '✨',
  },
  {
    id: 'blend',
    icon: Blend,
    title: 'Blend All Sources',
    description: 'Combine AI, documents, and web for comprehensive datasets.',
    color: '#ff71ce',
    emoji: '🔀',
  },
];

interface DataSourceSelectorProps {
  onSelect: (source: DataSourceType) => void;
  selectedSource?: DataSourceType | null;
}

export function DataSourceSelector({ onSelect, selectedSource }: DataSourceSelectorProps) {
  return (
    <div className="w-full font-['VT323',monospace]">
      {/* Window Frame */}
      <div className="bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#fffb96]">💾</span>
            <span className="text-white text-sm font-bold tracking-wide">Dataset Creator</span>
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
          <div className="text-center mb-6">
            <h2 className="text-2xl text-white drop-shadow-[2px_2px_#000080] tracking-wider mb-2">
              How do you want to create your dataset?
            </h2>
            <p className="text-[#fffb96] text-sm">
              Choose a starting point. Configure advanced settings later.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dataSourceOptions.map((option) => {
              const isSelected = selectedSource === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => onSelect(option.id)}
                  className={cn(
                    'group relative flex flex-col items-center p-4 transition-all',
                    'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                    isSelected
                      ? 'bg-[#000080] shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]'
                      : 'bg-[#c0c0c0] hover:bg-[#dfdfdf]'
                  )}
                >
                  {/* Icon Container */}
                  <div
                    className={cn(
                      'w-14 h-14 flex items-center justify-center mb-3 transition-all',
                      'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                      isSelected ? 'bg-[#008080]' : 'bg-[#c0c0c0] group-hover:bg-white'
                    )}
                    style={{
                      boxShadow: isSelected ? `0 0 15px ${option.color}40` : undefined,
                    }}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                  </div>

                  <h3
                    className={cn(
                      'font-bold mb-1 text-sm tracking-wide',
                      isSelected ? 'text-white' : 'text-[#000080]'
                    )}
                  >
                    {option.title}
                  </h3>

                  <p
                    className={cn(
                      'text-xs text-center leading-relaxed',
                      isSelected ? 'text-[#fffb96]' : 'text-[#808080]'
                    )}
                  >
                    {option.description}
                  </p>

                  {/* Select Button */}
                  <div
                    className={cn(
                      'mt-3 px-4 py-1 text-sm font-bold transition-all',
                      'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                      isSelected
                        ? 'text-[#000080] shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]'
                        : 'bg-[#c0c0c0] text-[#000080] hover:bg-[#dfdfdf]'
                    )}
                    style={{
                      backgroundColor: isSelected ? option.color : undefined,
                    }}
                  >
                    {isSelected ? '✓ Selected' : 'Select'}
                  </div>

                  {/* Neon glow effect for selected */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        boxShadow: `inset 0 0 30px ${option.color}`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-[#c0c0c0] border-t-2 border-[#dfdfdf] px-2 py-1 flex items-center gap-4">
          <div className="flex-1 px-2 py-0.5 bg-[#c0c0c0] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] text-xs text-[#000080]">
            {selectedSource
              ? `Selected: ${dataSourceOptions.find((o) => o.id === selectedSource)?.title}`
              : 'Ready - Select a data source to continue'}
          </div>
          <div className="px-2 py-0.5 bg-[#c0c0c0] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] text-xs text-[#000080]">
            4 options
          </div>
        </div>
      </div>
    </div>
  );
}
