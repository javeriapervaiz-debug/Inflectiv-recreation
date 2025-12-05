'use client';

import {
  FileText,
  Tag,
  Users,
  Building2,
  MapPin,
  Calendar,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Hash,
  Globe,
  FileType,
  Gauge,
  CheckSquare,
} from 'lucide-react';
import { Badge } from '@/components/atoms';
import { cn } from '@/lib/utils';
import type { StructuredData } from '@/types';

interface StructuredDataCardProps {
  data: StructuredData;
  tokenId: string;
  filename: string;
}

function SentimentIcon({ sentiment }: { sentiment: string }) {
  switch (sentiment) {
    case 'positive':
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    case 'negative':
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    case 'mixed':
      return <Sparkles className="w-4 h-4 text-yellow-400" />;
    default:
      return <Minus className="w-4 h-4 text-gray-400" />;
  }
}

function SentimentBadge({ sentiment, confidence }: { sentiment: string; confidence: number }) {
  const colorMap: Record<string, string> = {
    positive: 'bg-green-500/20 text-green-400 border-green-500/30',
    negative: 'bg-red-500/20 text-red-400 border-red-500/30',
    mixed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm', colorMap[sentiment] || colorMap.neutral)}>
      <SentimentIcon sentiment={sentiment} />
      <span className="capitalize font-medium">{sentiment}</span>
      <span className="text-xs opacity-70">({Math.round(confidence * 100)}%)</span>
    </div>
  );
}

function EntitySection({
  icon: Icon,
  title,
  items,
  color,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  color: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
        <Icon className={cn('w-3 h-3', color)} />
        <span>{title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-gray-800/50 border border-gray-700 rounded-md text-gray-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StructuredDataCard({ data, tokenId, filename }: StructuredDataCardProps) {
  return (
    <div className="mt-4 bg-black/50 border border-neon-green/30 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-neon-green/10 border-b border-neon-green/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neon-green/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-neon-green" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{data.title || filename}</h4>
              <p className="text-xs text-gray-500 font-mono">{tokenId}</p>
            </div>
          </div>
          <Badge variant="neon" size="sm">
            {data.category || 'General'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5">
        {/* Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-neon-green" />
            <span>Summary</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed bg-gray-900/50 rounded-lg p-3 border border-gray-800">
            {data.summary}
          </p>
        </div>

        {/* Sentiment */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span>Sentiment Analysis</span>
          </div>
          <div className="flex items-center gap-3">
            <SentimentBadge sentiment={data.sentiment.overall} confidence={data.sentiment.confidence} />
          </div>
          {data.sentiment.explanation && (
            <p className="text-xs text-gray-500 italic">{data.sentiment.explanation}</p>
          )}
        </div>

        {/* Keywords */}
        {data.keywords && data.keywords.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
              <Tag className="w-3 h-3 text-purple-400" />
              <span>Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 text-xs bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Entities */}
        {data.entities && (
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
              <Hash className="w-3 h-3 text-neon-green" />
              <span>Extracted Entities</span>
            </div>
            <div className="grid gap-3">
              <EntitySection icon={Users} title="People" items={data.entities.people} color="text-blue-400" />
              <EntitySection icon={Building2} title="Organizations" items={data.entities.organizations} color="text-orange-400" />
              <EntitySection icon={MapPin} title="Locations" items={data.entities.locations} color="text-red-400" />
              <EntitySection icon={Calendar} title="Dates" items={data.entities.dates} color="text-cyan-400" />
              <EntitySection icon={Lightbulb} title="Concepts" items={data.entities.concepts} color="text-yellow-400" />
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-800 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3" />
            <span>{data.language || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileType className="w-3 h-3" />
            <span>{data.metadata?.documentType || 'Document'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3 h-3" />
            <span className="capitalize">{data.metadata?.complexity || 'medium'} complexity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash className="w-3 h-3" />
            <span>{data.wordCount?.toLocaleString() || 0} words</span>
          </div>
        </div>

        {/* Action Items */}
        {data.metadata?.actionItems && data.metadata.actionItems.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
              <CheckSquare className="w-3 h-3 text-green-400" />
              <span>Action Items</span>
            </div>
            <ul className="space-y-1">
              {data.metadata.actionItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-neon-green mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
