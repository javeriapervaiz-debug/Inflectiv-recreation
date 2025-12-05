'use client';

import { useState } from 'react';
import { Globe, Link, Search, Plus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebSource {
  id: string;
  type: 'url' | 'search';
  value: string;
}

interface WebSourcePanelProps {
  onSourcesReady: (sources: WebSource[]) => void;
  onBack: () => void;
  isProcessing: boolean;
}

export function WebSourcePanel({ onSourcesReady, onBack, isProcessing }: WebSourcePanelProps) {
  const [sources, setSources] = useState<WebSource[]>([]);
  const [inputType, setInputType] = useState<'url' | 'search'>('url');
  const [inputValue, setInputValue] = useState('');

  const generateId = () => `web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const addSource = () => {
    if (!inputValue.trim()) return;

    if (inputType === 'url' && !isValidUrl(inputValue)) {
      if (isValidUrl(`https://${inputValue}`)) {
        setSources((prev) => [
          ...prev,
          { id: generateId(), type: 'url', value: `https://${inputValue}` },
        ]);
      } else {
        alert('Please enter a valid URL');
        return;
      }
    } else {
      setSources((prev) => [
        ...prev,
        { id: generateId(), type: inputType, value: inputValue.trim() },
      ]);
    }

    setInputValue('');
  };

  const removeSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSource();
    }
  };

  const handleSubmit = () => {
    if (sources.length > 0) {
      onSourcesReady(sources);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto font-['VT323',monospace]">
      {/* Window Frame */}
      <div className="bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-bold tracking-wide">Web Explorer</span>
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
              🌐 Extract Data from the Web
            </h2>
            <p className="text-[#fffb96] text-sm mt-1">
              Enter URLs or search topics to find data
            </p>
          </div>

          {/* Input Type Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setInputType('url')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold',
                'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                inputType === 'url'
                  ? 'bg-[#01cdfe] text-[#000080] shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]'
                  : 'bg-[#c0c0c0] text-[#000080] hover:bg-[#dfdfdf]'
              )}
            >
              <Link className="w-4 h-4" />
              Enter URL
            </button>
            <button
              onClick={() => setInputType('search')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold',
                'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                inputType === 'search'
                  ? 'bg-[#b967ff] text-white shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]'
                  : 'bg-[#c0c0c0] text-[#000080] hover:bg-[#dfdfdf]'
              )}
            >
              <Search className="w-4 h-4" />
              Search Topic
            </button>
          </div>

          {/* Input Field */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                {inputType === 'url' ? (
                  <Globe className="w-5 h-5 text-[#01cdfe]" />
                ) : (
                  <Search className="w-5 h-5 text-[#b967ff]" />
                )}
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  inputType === 'url'
                    ? 'https://example.com/data'
                    : 'Search for datasets about...'
                }
                className="w-full pl-9 pr-3 py-2 bg-white text-[#000080] placeholder:text-[#808080] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff,inset_2px_2px_#404040] focus:outline-none focus:ring-2 focus:ring-[#000080]"
              />
            </div>
            <button
              onClick={addSource}
              disabled={!inputValue.trim()}
              className={cn(
                'px-4 py-2 font-bold',
                'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                'active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]',
                inputValue.trim()
                  ? 'bg-[#05ffa1] text-[#000080] hover:bg-[#00ff88]'
                  : 'bg-[#c0c0c0] text-[#808080]'
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Sources List */}
          {sources.length > 0 && (
            <div className="mb-4">
              <div className="bg-[#c0c0c0] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] p-1 mb-2">
                <span className="text-[#000080] text-sm font-bold px-2">
                  {sources.length} source{sources.length !== 1 ? 's' : ''} added
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto bg-white shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff,inset_2px_2px_#404040] p-2">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className={cn(
                      'flex items-center gap-3 p-2 border-2',
                      source.type === 'url'
                        ? 'bg-[#01cdfe]/20 border-[#01cdfe]'
                        : 'bg-[#b967ff]/20 border-[#b967ff]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 flex items-center justify-center',
                        source.type === 'url' ? 'text-[#01cdfe]' : 'text-[#b967ff]'
                      )}
                    >
                      {source.type === 'url' ? (
                        <Link className="w-5 h-5" />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#808080] uppercase font-bold">
                        {source.type === 'url' ? '🔗 URL' : '🔍 SEARCH'}
                      </p>
                      <p className="text-sm text-[#000080] truncate">{source.value}</p>
                    </div>

                    <button
                      onClick={() => removeSource(source.id)}
                      className="w-5 h-5 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center hover:bg-[#ff71ce] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]"
                    >
                      <X className="w-3 h-3 text-[#000080]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {sources.length === 0 && (
            <div className="text-center py-8 bg-[#000080]/30 border-4 border-dashed border-[#c0c0c0]">
              <Globe className="w-12 h-12 mx-auto mb-3 text-[#01cdfe] opacity-50" />
              <p className="text-white text-sm">No sources added yet</p>
              <p className="text-[#fffb96] text-xs mt-1">Add URLs or search queries above</p>
            </div>
          )}
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
              Sources: {sources.length}
            </div>
            <button
              onClick={handleSubmit}
              disabled={sources.length === 0 || isProcessing}
              className={cn(
                'px-4 py-1 font-bold text-sm',
                'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                'active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]',
                'disabled:opacity-50',
                sources.length > 0 && !isProcessing
                  ? 'bg-[#01cdfe] text-[#000080] hover:bg-[#00d4ff]'
                  : 'bg-[#c0c0c0] text-[#808080]'
              )}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching...
                </span>
              ) : (
                <span>Extract from {sources.length} Source{sources.length !== 1 ? 's' : ''} ▶</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
