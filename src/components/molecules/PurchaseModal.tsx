'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Check, ExternalLink, AlertCircle, ShoppingCart, Minus, Plus } from 'lucide-react';
import { BrowserProvider } from 'ethers';
import {
  purchaseAccess,
  recordTransaction,
  formatPrice,
  type PurchaseParams,
  type PurchaseResult,
} from '@/lib/contracts';
import { type ListingData } from './ListingCard';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingData | null;
  provider: BrowserProvider | null;
  walletAddress: string;
  onPurchaseSuccess?: (result: PurchaseResult) => void;
}

type PurchaseStep = 'confirm' | 'purchasing' | 'success' | 'error';

export function PurchaseModal({
  isOpen,
  onClose,
  listing,
  provider,
  walletAddress,
  onPurchaseSuccess,
}: PurchaseModalProps) {
  const [step, setStep] = useState<PurchaseStep>('confirm');
  const [tokenAmount, setTokenAmount] = useState(1);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!listing) return null;

  const pricePerToken = listing.pricePerToken || 0n;
  const availableTokens = Number(listing.availableTokens || 0n);
  const totalPrice = pricePerToken * BigInt(tokenAmount);

  const handlePurchase = async () => {
    if (!provider || !walletAddress || !listing.listingId) {
      setError('Unable to complete purchase. Please check your wallet connection.');
      setStep('error');
      return;
    }

    setStep('purchasing');
    setError(null);

    try {
      const params: PurchaseParams = {
        listingId: Number(listing.listingId),
        tokenAmount,
        totalPrice,
      };

      const result = await purchaseAccess(provider, params);

      if (result.success) {
        setPurchaseResult(result);
        setStep('success');
        onPurchaseSuccess?.(result);

        // Record the transaction for earnings tracking (fire and forget)
        if (result.eventData) {
          recordTransaction(result, listing.creator?.walletAddress).catch((err) => {
            console.error('Failed to record transaction:', err);
          });
        }
      } else {
        setError(result.error || 'Purchase failed');
        setStep('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setPurchaseResult(null);
    setError(null);
    setTokenAmount(1);
    onClose();
  };

  const incrementTokens = () => {
    if (tokenAmount < availableTokens) {
      setTokenAmount((prev) => prev + 1);
    }
  };

  const decrementTokens = () => {
    if (tokenAmount > 1) {
      setTokenAmount((prev) => prev - 1);
    }
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
              <ShoppingCart className="w-4 h-4 text-[#fffb96]" />
              <span className="text-white text-sm font-bold">Purchase Access</span>
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
                  <h3 className="font-bold text-[#000080] mb-2">{listing.name}</h3>
                  <p className="text-sm text-[#404040] mb-2">{listing.description}</p>
                  <div className="flex items-center gap-2 text-xs text-[#808080]">
                    <span className="px-2 py-0.5 bg-[#fffb96] text-[#000080] font-bold">
                      {listing.category}
                    </span>
                  </div>
                </div>

                {/* Token Amount Selector */}
                <div className="space-y-2">
                  <label className="block text-sm text-[#000080] font-bold">
                    Number of Access Tokens
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={decrementTokens}
                      disabled={tokenAmount <= 1}
                      className="w-10 h-10 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff] disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={tokenAmount}
                      onChange={(e) =>
                        setTokenAmount(
                          Math.max(1, Math.min(availableTokens, parseInt(e.target.value) || 1))
                        )
                      }
                      min="1"
                      max={availableTokens}
                      className="flex-1 px-3 py-2 text-center bg-white shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] focus:outline-none text-lg font-bold"
                    />
                    <button
                      onClick={incrementTokens}
                      disabled={tokenAmount >= availableTokens}
                      className="w-10 h-10 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] flex items-center justify-center hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff] disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#808080]">{availableTokens} tokens available</p>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white p-3 shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff]">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Price per token:</span>
                      <span className="text-[#000080]">{formatPrice(pricePerToken)} MATIC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Quantity:</span>
                      <span className="text-[#000080]">{tokenAmount}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#c0c0c0]">
                      <span className="font-bold text-[#000080]">Total:</span>
                      <span className="font-bold text-[#05ffa1]">
                        {formatPrice(totalPrice)} MATIC
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fffb96] p-3 shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff]">
                  <p className="text-xs text-[#000080]">
                    <strong>Note:</strong> Each access token grants you access to view and download
                    the complete dataset. Tokens can be resold on the marketplace.
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
                    onClick={handlePurchase}
                    disabled={!provider || tokenAmount < 1}
                    className="flex-1 px-4 py-2 bg-[#05ffa1] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold hover:bg-[#00ff88] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Purchase
                  </button>
                </div>
              </div>
            )}

            {step === 'purchasing' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#000080] animate-spin" />
                <p className="text-lg font-bold text-[#000080]">Processing Purchase...</p>
                <p className="text-sm text-[#808080] mt-2">
                  Please confirm the transaction in your wallet
                </p>
                <div className="mt-4 h-2 bg-white shadow-[inset_1px_1px_#808080]">
                  <motion.div
                    className="h-full bg-[#05ffa1]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 30, ease: 'linear' }}
                  />
                </div>
              </div>
            )}

            {step === 'success' && purchaseResult && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#05ffa1] rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_#0a0a0a,inset_2px_2px_#ffffff]">
                  <Check className="w-8 h-8 text-[#000080]" />
                </div>
                <p className="text-lg font-bold text-[#000080]">Purchase Successful!</p>

                <div className="mt-4 bg-white p-3 shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Tokens Received:</span>
                      <span className="text-[#000080] font-bold">
                        {purchaseResult.tokensReceived}
                      </span>
                    </div>
                    {purchaseResult.transactionHash && (
                      <div className="pt-2 border-t border-[#c0c0c0]">
                        <a
                          href={`https://amoy.polygonscan.com/tx/${purchaseResult.transactionHash}`}
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
                  You now have access to view and download the dataset.
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
                <p className="text-lg font-bold text-[#ff0000]">Purchase Failed</p>
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
