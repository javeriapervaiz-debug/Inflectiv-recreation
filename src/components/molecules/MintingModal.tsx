'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Check, ExternalLink, AlertCircle, Coins } from 'lucide-react';
import { BrowserProvider } from 'ethers';
import {
  mintDataset,
  generateMetadataURI,
  type MintParams,
  type MintResult,
} from '@/lib/contracts';

interface MintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  name: string;
  description: string;
  category: string;
  tokenId: string; // Supabase token ID (INFL-xxx)
  provider: BrowserProvider | null;
  walletAddress: string;
  onMintSuccess?: (result: MintResult) => void;
}

type MintingStep = 'confirm' | 'minting' | 'success' | 'error';

export function MintingModal({
  isOpen,
  onClose,
  assetId,
  name,
  description,
  category,
  tokenId,
  provider,
  walletAddress,
  onMintSuccess,
}: MintingModalProps) {
  const [step, setStep] = useState<MintingStep>('confirm');
  const [accessTokens, setAccessTokens] = useState(100);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!provider || !walletAddress) {
      setError('Wallet not connected');
      setStep('error');
      return;
    }

    setStep('minting');
    setError(null);

    try {
      // Generate metadata URI
      const metadataURI = generateMetadataURI(assetId, name, description, category);

      const params: MintParams = {
        to: walletAddress,
        assetId,
        name,
        category,
        metadataURI,
        initialAccessSupply: accessTokens,
      };

      const result = await mintDataset(provider, params);

      if (result.success) {
        setMintResult(result);
        setStep('success');
        onMintSuccess?.(result);
      } else {
        setError(result.error || 'Minting failed');
        setStep('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setMintResult(null);
    setError(null);
    setAccessTokens(100);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] w-full max-w-md mx-4 font-['VT323',monospace]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title Bar */}
          <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#fffb96]" />
              <span className="text-white text-sm font-bold">Mint DataNFT</span>
            </div>
            <button
              onClick={handleClose}
              className="w-5 h-4 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff] flex items-center justify-center text-xs font-bold hover:bg-[#dfdfdf]"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {step === 'confirm' && (
              <div className="space-y-4">
                <div className="bg-white p-3 shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff]">
                  <h3 className="font-bold text-[#000080] mb-2">{name}</h3>
                  <p className="text-sm text-[#404040] mb-2">{description}</p>
                  <div className="flex items-center gap-2 text-xs text-[#808080]">
                    <span className="px-2 py-0.5 bg-[#fffb96] text-[#000080] font-bold">
                      {category}
                    </span>
                    <span>ID: {tokenId}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-[#000080] font-bold">
                    Access Tokens to Mint
                  </label>
                  <input
                    type="number"
                    value={accessTokens}
                    onChange={(e) => setAccessTokens(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="10000"
                    className="w-full px-3 py-2 bg-white shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] focus:outline-none"
                  />
                  <p className="text-xs text-[#808080]">
                    Each access token grants one user access to this dataset
                  </p>
                </div>

                <div className="bg-[#fffb96] p-3 shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff]">
                  <p className="text-xs text-[#000080]">
                    <strong>Note:</strong> Minting will create an NFT representing
                    ownership of this dataset, plus {accessTokens} access tokens that can
                    be sold on the marketplace. This requires a small gas fee.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMint}
                    disabled={!provider}
                    className="flex-1 px-4 py-2 bg-[#05ffa1] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold hover:bg-[#00ff88] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mint NFT
                  </button>
                </div>
              </div>
            )}

            {step === 'minting' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#000080] animate-spin" />
                <p className="text-lg font-bold text-[#000080]">Minting in Progress...</p>
                <p className="text-sm text-[#808080] mt-2">
                  Please confirm the transaction in your wallet
                </p>
                <div className="mt-4 h-2 bg-white shadow-[inset_1px_1px_#808080]">
                  <motion.div
                    className="h-full bg-[#000080]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 30, ease: 'linear' }}
                  />
                </div>
              </div>
            )}

            {step === 'success' && mintResult && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#05ffa1] rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_#0a0a0a,inset_2px_2px_#ffffff]">
                  <Check className="w-8 h-8 text-[#000080]" />
                </div>
                <p className="text-lg font-bold text-[#000080]">Minting Successful!</p>

                <div className="mt-4 bg-white p-3 shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Token ID:</span>
                      <span className="text-[#000080] font-bold">
                        {mintResult.tokenId?.toString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Access Tokens:</span>
                      <span className="text-[#000080] font-bold">{accessTokens}</span>
                    </div>
                    {mintResult.transactionHash && (
                      <div className="pt-2 border-t border-[#c0c0c0]">
                        <a
                          href={`https://amoy.polygonscan.com/tx/${mintResult.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#000080] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on Explorer
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="mt-4 w-full px-4 py-2 bg-[#05ffa1] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold hover:bg-[#00ff88] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff]"
                >
                  Done
                </button>
              </div>
            )}

            {step === 'error' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#ff5555] rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_#0a0a0a,inset_2px_2px_#ffffff]">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-bold text-[#ff0000]">Minting Failed</p>
                <p className="text-sm text-[#404040] mt-2">{error}</p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff]"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    className="flex-1 px-4 py-2 bg-[#fffb96] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold hover:bg-[#ffff00] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff]"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
