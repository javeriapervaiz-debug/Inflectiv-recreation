'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  Globe,
  Sparkles,
  Link,
  Search,
  Plus,
  X,
  FileText,
  File,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlendedSources {
  files: File[];
  urls: string[];
  searchQueries: string[];
  aiPrompt: string;
}

interface BlendSourcesPanelProps {
  onSourcesReady: (sources: BlendedSources) => void;
  onBack: () => void;
  isProcessing: boolean;
}

type ActiveTab = 'files' | 'web' | 'ai';

export function BlendSourcesPanel({ onSourcesReady, onBack, isProcessing }: BlendSourcesPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('files');
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSources =
    files.length + urls.length + searchQueries.length + (aiPrompt.trim() ? 1 : 0);

  const addFiles = (newFiles: FileList) => {
    setFiles((prev) => [...prev, ...Array.from(newFiles)]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addUrl = () => {
    if (urlInput.trim()) {
      let url = urlInput.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      setUrls((prev) => [...prev, url]);
      setUrlInput('');
    }
  };

  const removeUrl = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const addSearchQuery = () => {
    if (searchInput.trim()) {
      setSearchQueries((prev) => [...prev, searchInput.trim()]);
      setSearchInput('');
    }
  };

  const removeSearchQuery = (index: number) => {
    setSearchQueries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSourcesReady({
      files,
      urls,
      searchQueries,
      aiPrompt: aiPrompt.trim(),
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-[#ff71ce]" />;
      case 'csv':
        return <File className="w-4 h-4 text-[#05ffa1]" />;
      default:
        return <FileText className="w-4 h-4 text-[#01cdfe]" />;
    }
  };

  const tabs = [
    { id: 'files' as const, label: 'Files', icon: Upload, count: files.length, color: '#05ffa1' },
    { id: 'web' as const, label: 'Web', icon: Globe, count: urls.length + searchQueries.length, color: '#01cdfe' },
    { id: 'ai' as const, label: 'AI', icon: Sparkles, count: aiPrompt.trim() ? 1 : 0, color: '#b967ff' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto font-['VT323',monospace]">
      {/* Window Frame */}
      <div className="bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#fffb96]" />
            <span className="text-white text-sm font-bold tracking-wide">Blend Sources</span>
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
              🔀 Blend Multiple Sources
            </h2>
            <p className="text-[#fffb96] text-sm mt-1">
              Combine files, web, and AI for comprehensive datasets
            </p>
          </div>

          {/* Source Summary */}
          <div className="flex items-center justify-center gap-4 mb-4 p-2 bg-[#c0c0c0] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff]">
            <div className="flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4 text-[#05ffa1]" />
              <span className="text-[#000080] font-bold">{files.length} files</span>
            </div>
            <div className="w-px h-4 bg-[#808080]" />
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-[#01cdfe]" />
              <span className="text-[#000080] font-bold">{urls.length + searchQueries.length} web</span>
            </div>
            <div className="w-px h-4 bg-[#808080]" />
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-[#b967ff]" />
              <span className="text-[#000080] font-bold">{aiPrompt.trim() ? 'AI ✓' : 'No AI'}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold',
                    'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                    activeTab === tab.id
                      ? 'bg-[#000080] text-white shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]'
                      : 'bg-[#c0c0c0] text-[#000080] hover:bg-[#dfdfdf]'
                  )}
                >
                  <Icon className="w-4 h-4" style={{ color: activeTab === tab.id ? tab.color : undefined }} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 text-xs',
                        activeTab === tab.id
                          ? 'bg-white/20 text-white'
                          : 'bg-[#808080] text-white'
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px] p-3 bg-white shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff,inset_2px_2px_#404040]">
            {/* Files Tab */}
            {activeTab === 'files' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.csv,.txt,.md"
                  onChange={(e) => e.target.files && addFiles(e.target.files)}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-4 border-dashed border-[#808080] hover:border-[#05ffa1] transition-colors mb-3 bg-[#000080]/5"
                >
                  <Upload className="w-8 h-8 text-[#05ffa1] mx-auto mb-2" />
                  <p className="text-[#000080] text-sm font-bold">Click to add files (PDF, CSV, TXT, MD)</p>
                </button>

                {files.length > 0 && (
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-1.5 bg-[#000080]/10 border border-[#000080]"
                      >
                        {getFileIcon(file.name)}
                        <span className="flex-1 text-sm text-[#000080] truncate font-bold">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="w-4 h-4 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff] flex items-center justify-center hover:bg-[#ff71ce]"
                        >
                          <X className="w-3 h-3 text-[#000080]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Web Tab */}
            {activeTab === 'web' && (
              <div className="space-y-3">
                {/* URL Input */}
                <div>
                  <label className="block text-xs text-[#000080] font-bold mb-1">Add URL:</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Link className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#01cdfe]" />
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                        placeholder="https://example.com"
                        className="w-full pl-8 pr-3 py-1.5 bg-white text-[#000080] placeholder:text-[#808080] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff,inset_2px_2px_#404040] focus:outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={addUrl}
                      className="px-3 py-1 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]"
                    >
                      <Plus className="w-4 h-4 text-[#000080]" />
                    </button>
                  </div>
                </div>

                {/* Search Input */}
                <div>
                  <label className="block text-xs text-[#000080] font-bold mb-1">Search Topic:</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b967ff]" />
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSearchQuery()}
                        placeholder="Search for data about..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white text-[#000080] placeholder:text-[#808080] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff,inset_2px_2px_#404040] focus:outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={addSearchQuery}
                      className="px-3 py-1 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]"
                    >
                      <Plus className="w-4 h-4 text-[#000080]" />
                    </button>
                  </div>
                </div>

                {/* Added Sources */}
                {(urls.length > 0 || searchQueries.length > 0) && (
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {urls.map((url, index) => (
                      <div
                        key={`url-${index}`}
                        className="flex items-center gap-2 p-1.5 bg-[#01cdfe]/20 border border-[#01cdfe]"
                      >
                        <Link className="w-4 h-4 text-[#01cdfe]" />
                        <span className="flex-1 text-sm text-[#000080] truncate">{url}</span>
                        <button
                          onClick={() => removeUrl(index)}
                          className="w-4 h-4 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff] flex items-center justify-center hover:bg-[#ff71ce]"
                        >
                          <X className="w-3 h-3 text-[#000080]" />
                        </button>
                      </div>
                    ))}
                    {searchQueries.map((query, index) => (
                      <div
                        key={`search-${index}`}
                        className="flex items-center gap-2 p-1.5 bg-[#b967ff]/20 border border-[#b967ff]"
                      >
                        <Search className="w-4 h-4 text-[#b967ff]" />
                        <span className="flex-1 text-sm text-[#000080] truncate">{query}</span>
                        <button
                          onClick={() => removeSearchQuery(index)}
                          className="w-4 h-4 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff] flex items-center justify-center hover:bg-[#ff71ce]"
                        >
                          <X className="w-3 h-3 text-[#000080]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI Tab */}
            {activeTab === 'ai' && (
              <div>
                <label className="block text-xs text-[#000080] font-bold mb-1">
                  AI Enhancement Prompt (optional):
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe additional data you want AI to generate or how to enhance the collected data..."
                  rows={4}
                  className="w-full px-3 py-2 bg-white text-[#000080] placeholder:text-[#808080] shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff,inset_2px_2px_#404040] focus:outline-none resize-none text-sm"
                />
                <p className="mt-1 text-xs text-[#808080]">
                  The AI will use this to enrich and expand data from files and web sources
                </p>
                {aiPrompt.trim() && (
                  <div className="mt-2 flex items-center gap-2 text-[#05ffa1] text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>AI enhancement enabled!</span>
                  </div>
                )}
              </div>
            )}
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
              Total: {totalSources} sources
            </div>
            <button
              onClick={handleSubmit}
              disabled={totalSources === 0 || isProcessing}
              className={cn(
                'px-4 py-1 font-bold text-sm',
                'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]',
                'active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]',
                'disabled:opacity-50',
                totalSources > 0 && !isProcessing
                  ? 'bg-gradient-to-r from-[#ff71ce] via-[#01cdfe] to-[#05ffa1] text-[#000080] hover:opacity-90'
                  : 'bg-[#c0c0c0] text-[#808080]'
              )}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span>Blend {totalSources} Source{totalSources !== 1 ? 's' : ''} ▶</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
