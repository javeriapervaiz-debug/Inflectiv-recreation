'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Check, ExternalLink, AlertCircle, Store, Coins } from 'lucide-react';
import { BrowserProvider } from 'ethers';
import {
  createListing,
  type ListingParams,
  type ListingResult,
  PLATFORM_CONFIG,
} from '@/lib/contracts';

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetName: string;
  datasetTokenId: number;
  availableTokens: number;
  provider: BrowserProvider | null;
  onListingSuccess?: (result: ListingResult) => void;
}

type ListingStep = 'configure' | 'creating' | 'success' | 'error';

export function ListingModal({
  isOpen,
  onClose,
  datasetName,
  datasetTokenId,
  availableTokens,
  provider,
  onListingSuccess,
}: ListingModalProps) {
  const [step, setStep] = useState<ListingStep>('configure');
  const [pricePerToken, setPricePerToken] = useState('0.01');
  const [tokenAmount, setTokenAmount] = useState(Math.min(availableTokens, 10));
  const [listingResult, setListingResult] = useState<ListingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateListing = async () => {
    if (!provider) {
      setError('Wallet not connected');
      setStep('error');
      return;
    }

    // Validate price
    const price = parseFloat(pricePerToken);
    if (isNaN(price) || price < parseFloat(PLATFORM_CONFIG.minListingPrice)) {
      setError(`Minimum price is ${PLATFORM_CONFIG.minListingPrice} MATIC`);
      setStep('error');
      return;
    }

    setStep('creating');
    setError(null);

    try {
      const params: ListingParams = {
        datasetTokenId,
        pricePerToken,
        tokenAmount,
      };

      const result = await createListing(provider, params);

      if (result.success) {
        setListingResult(result);
        setStep('success');
        onListingSuccess?.(result);
      } else {
        setError(result.error || 'Failed to create listing');
        setStep('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('configure');
    setListingResult(null);
    setError(null);
    setPricePerToken('0.01');
    setTokenAmount(Math.min(availableTokens, 10));
    onClose();
  };

  if (!isOpen) return null;

  // Calculate estimated earnings
  const price = parseFloat(pricePerToken) || 0;
  const totalRevenue = price * tokenAmount;
  const platformFee = totalRevenue * (PLATFORM_CONFIG.platformFeeBps / 10000);
  const royalty = totalRevenue * (PLATFORM_CONFIG.defaultRoyaltyBps / 10000);
  const sellerEarnings = totalRevenue - platformFee - royalty;

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
              <Store className="w-4 h-4 text-[#fffb96]" />
              <span className="text-white text-sm font-bold">Create Listing</span>
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
            {step === 'configure' && (
              <div className="space-y-4">
                <div className="bg-white p-3 shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff]">
                  <h3 className="font-bold text-[#000080] mb-2">{datasetName}</h3>
                  <p className="text-xs text-[#808080]">
                    Token ID: #{datasetTokenId} | {availableTokens} access tokens available
                  </p>
                </div>

                {/* Price Input */}
                <div className="space-y-2">
                  <label className="block text-sm text-[#000080] font-bold">
                    Price per Access Token (MATIC)
                  </label>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#b967ff]" />
                    <input
                      type="number"
                      value={pricePerToken}
                      onChange={(e) => setPricePerToken(e.target.value)}
                      min={PLATFORM_CONFIG.minListingPrice}
                      step="0.001"
                      className="flex-1 px-3 py-2 bg-white shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-[#808080]">
                    Minimum: {PLATFORM_CONFIG.minListingPrice} MATIC
                  </p>
                </div>

                {/* Token Amount */}
                <div className="space-y-2">
                  <label className="block text-sm text-[#000080] font-bold">
                    Number of Tokens to List
                  </label>
                  <input
                    type="range"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(parseInt(e.target.value))}
                    min="1"
                    max={availableTokens}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[#808080]">
                    <span>1</span>
                    <span className="font-bold text-[#000080]">{tokenAmount} tokens</span>
                    <span>{availableTokens}</span>
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white p-3 shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff]">
                  <h4 className="font-bold text-[#000080] mb-2 text-sm">Estimated Revenue</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Total Sales:</span>
                      <span className="text-[#000080]">{totalRevenue.toFixed(4)} MATIC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Platform Fee (2.5%):</span>
                      <span className="text-[#ff5555]">-{platformFee.toFixed(4)} MATIC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Creator Royalty (5%):</span>
                      <span className="text-[#05ffa1]">-{royalty.toFixed(4)} MATIC</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#c0c0c0]">
                      <span className="font-bold text-[#000080]">Your Earnings:</span>
                      <span className="font-bold text-[#05ffa1]">
                        {sellerEarnings.toFixed(4)} MATIC
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fffb96] p-3 shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff]">
                  <p className="text-xs text-[#000080]">
                    <strong>Note:</strong> Buyers will receive access tokens that grant them access
                    to view and download your dataset. You retain ownership of the DataNFT.
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
                    onClick={handleCreateListing}
                    disabled={!provider || tokenAmount < 1}
                    className="flex-1 px-4 py-2 bg-[#b967ff] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-white font-bold hover:bg-[#a050ff] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Listing
                  </button>
                </div>
              </div>
            )}

            {step === 'creating' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#b967ff] animate-spin" />
                <p className="text-lg font-bold text-[#000080]">Creating Listing...</p>
                <p className="text-sm text-[#808080] mt-2">
                  Please confirm the transaction in your wallet
                </p>
                <div className="mt-4 h-2 bg-white shadow-[inset_1px_1px_#808080]">
                  <motion.div
                    className="h-full bg-[#b967ff]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 30, ease: 'linear' }}
                  />
                </div>
              </div>
            )}

            {step === 'success' && listingResult && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#05ffa1] rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_#0a0a0a,inset_2px_2px_#ffffff]">
                  <Check className="w-8 h-8 text-[#000080]" />
                </div>
                <p className="text-lg font-bold text-[#000080]">Listing Created!</p>

                <div className="mt-4 bg-white p-3 shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Listing ID:</span>
                      <span className="text-[#000080] font-bold">
                        #{listingResult.listingId?.toString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Tokens Listed:</span>
                      <span className="text-[#000080] font-bold">{tokenAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Price:</span>
                      <span className="text-[#000080] font-bold">{pricePerToken} MATIC</span>
                    </div>
                    {listingResult.transactionHash && (
                      <div className="pt-2 border-t border-[#c0c0c0]">
                        <a
                          href={`https://amoy.polygonscan.com/tx/${listingResult.transactionHash}`}
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

                <p className="text-sm text-[#404040] mt-4">
                  Your dataset is now listed on the marketplace!
                </p>

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
                <p className="text-lg font-bold text-[#ff0000]">Listing Failed</p>
                <p className="text-sm text-[#404040] mt-2">{error}</p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff]"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setStep('configure')}
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
