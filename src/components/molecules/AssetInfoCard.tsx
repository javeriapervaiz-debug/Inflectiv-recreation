'use client';

import { useState } from 'react';
import { Database, FileText, Hash, Coins, Check, Store, Loader2 } from 'lucide-react';
import { BrowserProvider } from 'ethers';
import { MintingModal } from './MintingModal';
import { type MintResult } from '@/lib/contracts';

interface AssetInfoCardProps {
  assetId: string;
  generatedName: string;
  generatedDescription: string;
  category: string;
  tokenId: string;
  filename: string;
  provider?: BrowserProvider | null;
  walletAddress?: string;
  onMintSuccess?: (result: MintResult) => void;
  isMinted?: boolean;
  blockchainTokenId?: string;
}

export function AssetInfoCard({
  assetId,
  generatedName,
  generatedDescription,
  category,
  tokenId,
  filename,
  provider,
  walletAddress,
  onMintSuccess,
  isMinted = false,
  blockchainTokenId,
}: AssetInfoCardProps) {
  const [showMintModal, setShowMintModal] = useState(false);
  const [minted, setMinted] = useState(isMinted);
  const [mintedTokenId, setMintedTokenId] = useState(blockchainTokenId);

  const handleMintSuccess = (result: MintResult) => {
    setMinted(true);
    if (result.tokenId) {
      setMintedTokenId(result.tokenId.toString());
    }
    onMintSuccess?.(result);
  };

  return (
    <>
      <div className="mt-4 font-['VT323',monospace] bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#008000] to-[#00a000] px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-bold">Dataset Created</span>
          </div>
          <div className="flex items-center gap-2">
            {minted && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#05ffa1] text-[#000080] text-xs font-bold shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff]">
                <Check className="w-3 h-3" />
                Minted
              </div>
            )}
            <div className="px-2 py-0.5 bg-[#fffb96] text-[#000080] text-xs font-bold shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff]">
              {category}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 bg-white">
          {/* Name and Token */}
          <div className="mb-3 pb-3 border-b-2 border-[#c0c0c0]">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4 text-[#000080]" />
              <span className="text-[#808080] text-sm">{tokenId}</span>
              {mintedTokenId && (
                <span className="text-[#05ffa1] text-sm ml-2">
                  (NFT #{mintedTokenId})
                </span>
              )}
            </div>
            <h4 className="text-lg font-bold text-[#000080]">{generatedName}</h4>
          </div>

          {/* Description */}
          <p className="text-base text-[#000000] leading-relaxed mb-3">
            {generatedDescription}
          </p>

          {/* Source info */}
          {filename && (
            <div className="flex items-center gap-2 pt-3 border-t-2 border-[#c0c0c0] mb-3">
              <FileText className="w-4 h-4 text-[#808080]" />
              <span className="text-sm text-[#404040]">Source: {filename}</span>
            </div>
          )}

          {/* Action Buttons */}
          {provider && walletAddress && (
            <div className="flex gap-2 pt-3 border-t-2 border-[#c0c0c0]">
              {!minted ? (
                <button
                  onClick={() => setShowMintModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#05ffa1] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold text-sm hover:bg-[#00ff88] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff]"
                >
                  <Coins className="w-4 h-4" />
                  Mint as NFT
                </button>
              ) : (
                <button
                  onClick={() => {
                    // TODO: Navigate to marketplace listing
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#b967ff] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-white font-bold text-sm hover:bg-[#a050ff] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff]"
                >
                  <Store className="w-4 h-4" />
                  List on Marketplace
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Minting Modal */}
      <MintingModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        assetId={assetId}
        name={generatedName}
        description={generatedDescription}
        category={category}
        tokenId={tokenId}
        provider={provider || null}
        walletAddress={walletAddress || ''}
        onMintSuccess={handleMintSuccess}
      />
    </>
  );
}
