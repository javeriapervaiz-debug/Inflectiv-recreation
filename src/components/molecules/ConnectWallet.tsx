'use client';

import { useState } from 'react';
import { Wallet, LogOut, ChevronDown, Copy, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWeb3Auth } from '@/lib/web3auth';
import { Button } from '@/components/atoms';

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBalance(balance: string): string {
  const eth = parseFloat(balance) / 1e18;
  return eth.toFixed(4);
}

export function ConnectWallet() {
  const {
    user,
    isLoading,
    isConnected,
    error,
    connect,
    disconnect,
  } = useWeb3Auth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (user?.walletAddress) {
      await navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewOnExplorer = () => {
    if (user?.walletAddress) {
      window.open(
        `https://etherscan.io/address/${user.walletAddress}`,
        '_blank'
      );
    }
  };

  // Not connected state
  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={isLoading}
        className="flex items-center gap-2 bg-gradient-to-r from-[#ff71ce] to-[#b967ff] hover:from-[#ff8fd8] hover:to-[#c77fff] text-white font-semibold px-4 py-2 rounded-lg shadow-lg shadow-purple-500/25 transition-all duration-200"
      >
        <Wallet className="w-4 h-4" />
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  // Connected state
  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-lg px-3 py-2 transition-all duration-200"
      >
        {/* Avatar */}
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#ff71ce] to-[#01cdfe] flex items-center justify-center">
            <Wallet className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Address */}
        <span className="text-sm font-medium text-gray-200">
          {formatAddress(user?.walletAddress || '')}
        </span>

        {/* Balance */}
        <span className="text-xs text-gray-400 hidden sm:block">
          {formatBalance(user?.balance || '0')} ETH
        </span>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
          >
            {/* User info */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ff71ce] to-[#01cdfe] flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    {user?.name || 'Anonymous'}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-gray-400">{user.email}</p>
                  )}
                </div>
              </div>

              {/* Wallet address */}
              <div className="flex items-center justify-between bg-gray-900 rounded px-2 py-1.5 mt-2">
                <span className="text-xs text-gray-300 font-mono">
                  {formatAddress(user?.walletAddress || '')}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Copy address"
                  >
                    <Copy className="w-3 h-3 text-gray-400" />
                  </button>
                  <button
                    onClick={handleViewOnExplorer}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>
              {copied && (
                <p className="text-xs text-green-400 mt-1">Copied!</p>
              )}
            </div>

            {/* Balance */}
            <div className="p-4 border-b border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Balance</p>
              <p className="text-lg font-semibold text-white">
                {formatBalance(user?.balance || '0')} ETH
              </p>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => {
                  disconnect();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Error display */}
      {error && (
        <p className="absolute top-full mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
