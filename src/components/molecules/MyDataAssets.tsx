'use client';

import { useState } from 'react';
import {
  Database,
  MoreVertical,
  Edit3,
  Coins,
  Loader2,
  FolderOpen,
  Calendar,
  Tag,
  CheckCircle,
  Clock,
  FileText,
  Trash2,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';

interface Asset {
  id: string;
  token_id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: string;
  is_minted: boolean;
  created_at: string;
  updated_at: string;
  blockchain_token_id: string | null;
  structured_data: Record<string, unknown>;
}

interface MyDataAssetsProps {
  userId: string | undefined;
  onEditAsset: (asset: Asset) => void;
  onMintAsset: (asset: Asset) => void;
}

export function MyDataAssets({ userId, onEditAsset, onMintAsset }: MyDataAssetsProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Fetch user's assets
  const { data: assets, isLoading, error, refetch } = trpc.asset.getByUser.useQuery(
    { userId: userId || '' },
    { enabled: !!userId }
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#b5ead7] text-[#3d3d3d]';
      case 'processing':
        return 'bg-[#ffeaa7] text-[#3d3d3d]';
      case 'draft':
        return 'bg-[#e8e0ed] text-[#5a5a5a]';
      case 'archived':
        return 'bg-[#d5c8de] text-[#5a5a5a]';
      default:
        return 'bg-[#e8e0ed] text-[#5a5a5a]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3" />;
      case 'processing':
        return <Clock className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'financial':
        return 'bg-[#b5ead7]/50 text-[#3d3d3d]';
      case 'legal':
        return 'bg-[#dbb4f3]/50 text-[#3d3d3d]';
      case 'technical':
        return 'bg-[#a8d8ea]/50 text-[#3d3d3d]';
      case 'medical':
        return 'bg-[#ffb5c5]/50 text-[#3d3d3d]';
      case 'research':
        return 'bg-[#ffeaa7]/50 text-[#3d3d3d]';
      case 'business':
        return 'bg-[#a0e7e5]/50 text-[#3d3d3d]';
      default:
        return 'bg-[#e8e0ed]/50 text-[#5a5a5a]';
    }
  };

  if (!userId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <FolderOpen className="w-16 h-16 text-[#d5c8de] mb-4" />
        <h3 className="text-lg font-semibold text-[#3d3d3d] mb-2">Not Connected</h3>
        <p className="text-sm text-[#8b7b9b]">Please connect your wallet to view your assets</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Loader2 className="w-10 h-10 animate-spin text-[#8b7ba8] mb-4" />
        <p className="text-sm text-[#8b7b9b]">Loading your assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <FolderOpen className="w-16 h-16 text-[#ffb7b2] mb-4" />
        <h3 className="text-lg font-semibold text-[#3d3d3d] mb-2">Error Loading Assets</h3>
        <p className="text-sm text-[#8b7b9b] mb-4">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#b4a7d6] text-white rounded-lg text-sm font-medium hover:bg-[#a89cc5] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <FolderOpen className="w-20 h-20 text-[#d5c8de] mb-4" />
        <h3 className="text-xl font-bold text-[#3d3d3d] mb-2">No Data Assets Yet</h3>
        <p className="text-[#8b7b9b] mb-4 max-w-sm">
          Start by uploading your data in the Upload Data app. Your processed datasets will appear here.
        </p>
        <div className="flex items-center gap-2 text-sm text-[#b4a7d6]">
          <Database className="w-4 h-4" />
          <span>Click "Upload Data" on the desktop to get started</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#e8e0ed]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#8b7ba8]" />
            <h2 className="font-semibold text-[#3d3d3d]">My Data Assets</h2>
            <span className="px-2 py-0.5 bg-[#e8e0ed] rounded-full text-xs font-medium text-[#5a5a5a]">
              {assets.length}
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-[#e8e0ed] rounded-lg transition-colors"
            title="Refresh"
          >
            <Loader2 className={cn('w-4 h-4 text-[#8b7b9b]', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {assets.map((asset: Asset) => (
            <div
              key={asset.id}
              className="bg-white/70 rounded-xl p-4 shadow-[0_2px_8px_rgba(139,123,168,0.1)] hover:shadow-[0_4px_16px_rgba(139,123,168,0.15)] transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Asset Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#3d3d3d] truncate">{asset.name}</h3>
                    {asset.is_minted && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-[#dbb4f3]/30 rounded-full text-xs font-medium text-[#8b7ba8]">
                        <Coins className="w-3 h-3" />
                        Minted
                      </span>
                    )}
                  </div>

                  {asset.description && (
                    <p className="text-sm text-[#8b7b9b] line-clamp-2 mb-2">
                      {asset.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Status Badge */}
                    <span className={cn(
                      'flex items-center gap-1 px-2 py-0.5 rounded-full font-medium',
                      getStatusColor(asset.status)
                    )}>
                      {getStatusIcon(asset.status)}
                      {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                    </span>

                    {/* Category Badge */}
                    {asset.category && (
                      <span className={cn(
                        'flex items-center gap-1 px-2 py-0.5 rounded-full font-medium capitalize',
                        getCategoryColor(asset.category)
                      )}>
                        <Tag className="w-3 h-3" />
                        {asset.category}
                      </span>
                    )}

                    {/* Created Date */}
                    <span className="flex items-center gap-1 text-[#8b7b9b]">
                      <Calendar className="w-3 h-3" />
                      {formatDate(asset.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === asset.id ? null : asset.id)}
                    className="p-2 hover:bg-[#e8e0ed] rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-[#8b7b9b]" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === asset.id && (
                    <>
                      {/* Backdrop to close menu */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />

                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-[0_4px_16px_rgba(139,123,168,0.2)] border border-[#e8e0ed] overflow-hidden z-20">
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            onEditAsset(asset);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#3d3d3d] hover:bg-[#f5f0f7] transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-[#8b7ba8]" />
                          Edit Dataset
                        </button>

                        {!asset.is_minted && (
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              onMintAsset(asset);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#3d3d3d] hover:bg-[#f5f0f7] transition-colors"
                          >
                            <Coins className="w-4 h-4 text-[#fdcb6e]" />
                            Mint as NFT
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            // View details - could open a modal or navigate
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#3d3d3d] hover:bg-[#f5f0f7] transition-colors"
                        >
                          <Eye className="w-4 h-4 text-[#a0e7e5]" />
                          View Details
                        </button>

                        <div className="border-t border-[#e8e0ed]" />

                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            // Delete functionality - should confirm first
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#ff6b6b] hover:bg-[#ffb7b2]/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Token ID */}
              <div className="mt-3 pt-3 border-t border-[#e8e0ed]">
                <p className="text-xs text-[#b8a8c5] font-mono">
                  Token ID: {asset.token_id}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
