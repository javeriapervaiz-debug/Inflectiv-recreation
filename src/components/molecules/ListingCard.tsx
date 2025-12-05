'use client';

import { Database, Hash, User, Coins, ShoppingCart, Tag } from 'lucide-react';
import { formatPrice } from '@/lib/contracts';

export interface ListingData {
  // From Supabase
  id: string;
  name: string;
  description: string;
  category: string;
  tokenId: string;
  blockchainTokenId?: string;
  creator?: {
    username?: string;
    displayName?: string;
    walletAddress?: string;
  };
  // From blockchain
  listingId?: bigint;
  pricePerToken?: bigint;
  availableTokens?: bigint;
  totalSold?: bigint;
}

interface ListingCardProps {
  listing: ListingData;
  onPurchase?: (listing: ListingData) => void;
  onViewDetails?: (listing: ListingData) => void;
}

export function ListingCard({ listing, onPurchase, onViewDetails }: ListingCardProps) {
  const creatorName =
    listing.creator?.displayName ||
    listing.creator?.username ||
    (listing.creator?.walletAddress
      ? `${listing.creator.walletAddress.slice(0, 6)}...${listing.creator.walletAddress.slice(-4)}`
      : 'Unknown');

  const formattedPrice = listing.pricePerToken
    ? formatPrice(listing.pricePerToken)
    : '0.00';

  const availableCount = listing.availableTokens?.toString() || '0';

  return (
    <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] hover:shadow-[inset_-2px_-2px_#0a0a0a,inset_2px_2px_#ffffff,inset_-3px_-3px_#808080,inset_3px_3px_#dfdfdf] transition-all card-hover-lift">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Database className="w-5 h-5 text-[#fff7b3] flex-shrink-0" />
          <span className="text-white text-lg font-bold truncate">
            {listing.name}
          </span>
        </div>
        <div className="px-3 py-1 bg-[#fff7b3] text-[#000080] text-sm font-bold shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff] capitalize flex-shrink-0 ml-2">
          {listing.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 bg-white">
        {/* Token IDs */}
        <div className="flex items-center gap-3 mb-3 text-sm text-[#606060]">
          <Hash className="w-4 h-4" />
          <span className="font-mono">{listing.tokenId.slice(0, 12)}...</span>
          {listing.blockchainTokenId && (
            <span className="px-2 py-0.5 bg-[#e6fff0] text-[#006b4d] font-semibold text-sm">
              NFT #{listing.blockchainTokenId}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-base text-[#000000] leading-relaxed mb-4 line-clamp-2 min-h-[3rem]">
          {listing.description || 'No description available for this dataset.'}
        </p>

        {/* Creator */}
        <div className="flex items-center gap-2 pb-3 border-b border-[#c3c3c3] mb-4">
          <User className="w-4 h-4 text-[#808080]" />
          <span className="text-base text-[#404040]">by <strong>{creatorName}</strong></span>
        </div>

        {/* Price & Availability */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#d4a5ff]" />
            <span className="text-2xl font-bold text-[#000080]">{formattedPrice}</span>
            <span className="text-base text-[#808080]">MATIC</span>
          </div>
          <div className="flex items-center gap-2 bg-[#f5f0ff] px-3 py-1.5">
            <Tag className="w-4 h-4 text-[#808080]" />
            <span className="text-base text-[#404040] font-medium">{availableCount} available</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onViewDetails?.(listing)}
            className="flex-1 px-4 py-3 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold text-base hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff] transition-all"
          >
            Details
          </button>
          <button
            onClick={() => onPurchase?.(listing)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#7fff9f] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold text-base hover:bg-[#5fff8f] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff] transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}
