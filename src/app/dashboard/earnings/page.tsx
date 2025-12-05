'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Coins,
  TrendingUp,
  Clock,
  Database,
  Loader2,
  RefreshCw,
  ExternalLink,
  Trophy,
  ArrowUpRight,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { ConnectWallet } from '@/components/molecules';
import { useWeb3Auth, useAuthSync } from '@/lib/web3auth';
import { getExplorerUrl } from '@/lib/contracts';
import { cn } from '@/lib/utils';

interface EarningsSummary {
  totalEarnings: string;
  totalSalesEarnings: string;
  totalRoyaltyEarnings: string;
  thisMonthEarnings: string;
  totalTransactions: number;
  totalSalesCount: number;
  totalRoyaltiesCount: number;
  totalTokensSold: number;
  currency: string;
}

interface Transaction {
  id: string;
  transactionHash: string;
  assetName: string;
  assetTokenId: string;
  earningType: 'sale' | 'royalty';
  earnedAmount: string;
  totalAmount: string;
  tokenAmount: number;
  buyerAddress: string;
  createdAt: string;
  chainId: number;
}

interface TopAsset {
  rank: number;
  assetId: string;
  assetName: string;
  assetTokenId: string;
  totalEarned: string;
  totalTokensSold: number;
  transactionCount: number;
}

export default function EarningsPage() {
  const router = useRouter();
  const { isConnected, isInitialized, user } = useWeb3Auth();
  const { dbUser } = useAuthSync();

  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [topAssets, setTopAssets] = useState<TopAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'royalties'>('all');

  // Redirect to auth if not connected
  useEffect(() => {
    if (isInitialized && !isConnected) {
      router.push('/auth');
    }
  }, [isInitialized, isConnected, router]);

  const fetchEarningsData = useCallback(async () => {
    if (!user?.walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [summaryRes, transactionsRes, topAssetsRes] = await Promise.all([
        fetch(`/api/earnings/summary?walletAddress=${user.walletAddress}`),
        fetch(`/api/earnings/transactions?walletAddress=${user.walletAddress}&type=${activeTab}&limit=10`),
        fetch(`/api/earnings/top-assets?walletAddress=${user.walletAddress}&limit=5`),
      ]);

      const [summaryData, transactionsData, topAssetsData] = await Promise.all([
        summaryRes.json(),
        transactionsRes.json(),
        topAssetsRes.json(),
      ]);

      if (summaryData.success) {
        setSummary(summaryData.data);
      }

      if (transactionsData.success) {
        setTransactions(transactionsData.data.transactions);
      }

      if (topAssetsData.success) {
        setTopAssets(topAssetsData.data.topAssets);
      }
    } catch (err) {
      console.error('Failed to fetch earnings data:', err);
      setError('Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.walletAddress, activeTab]);

  useEffect(() => {
    if (user?.walletAddress) {
      fetchEarningsData();
    }
  }, [fetchEarningsData, user?.walletAddress]);

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1233] via-[#2a1f4e] to-[#3d2d6b]">
        <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#000080]" />
          <p className="text-black text-xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#1e1233] via-[#2a1f4e] to-[#3d2d6b]" />
      <div className="fixed inset-0 grid-pattern opacity-30" />

      {/* Decorative elements */}
      <div className="fixed top-32 right-20 w-20 h-20 decorative-sphere opacity-30 animate-float" />
      <div className="fixed bottom-48 left-16 w-28 h-28 decorative-ring opacity-20 animate-float" style={{ animationDelay: '1.5s' }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header Window */}
        <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] mb-8">
          {/* Title Bar */}
          <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-[#fff7b3]" />
              <span className="text-white text-xl font-bold tracking-wide">
                Earnings Center
              </span>
              <span className="text-white/70 text-lg">- INFLECTIV.exe</span>
            </div>
            <div className="flex items-center gap-4">
              <ConnectWallet />
              <div className="flex gap-1">
                <span className="w-5 h-5 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff] text-sm flex items-center justify-center font-bold">_</span>
                <span className="w-5 h-5 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff] text-sm flex items-center justify-center font-bold">□</span>
                <span className="w-5 h-5 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff] text-sm flex items-center justify-center font-bold">×</span>
              </div>
            </div>
          </div>

          {/* Menu Bar */}
          <div className="bg-[#c3c3c3] border-b border-[#808080] px-3 py-1.5 flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-[#000080] text-base font-medium hover:bg-[#000080] hover:text-white px-2 py-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/marketplace"
              className="text-[#000080] text-base font-medium hover:bg-[#000080] hover:text-white px-2 py-1 transition-colors"
            >
              Marketplace
            </Link>
          </div>

          {/* Description */}
          <div className="p-5 text-black">
            <p className="text-lg leading-relaxed">
              Track your earnings from dataset sales and royalties. Every time someone purchases
              access to your datasets, you earn <strong>{summary?.currency || 'MATIC'}</strong>.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Earned */}
          <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#7fff9f] shadow-[inset_1px_1px_#808080,0_0_15px_rgba(127,255,159,0.5)] flex items-center justify-center">
                <Wallet className="w-7 h-7 text-[#000080]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#000080]">
                  {isLoading ? '...' : summary?.totalEarnings || '0.0000'}
                </p>
                <p className="text-base text-[#000080] font-medium">{summary?.currency || 'MATIC'}</p>
                <p className="text-sm text-[#404040] mt-1">Total Earned</p>
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#7fdbff] shadow-[inset_1px_1px_#808080,0_0_15px_rgba(127,219,255,0.5)] flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-[#000080]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#000080]">
                  {isLoading ? '...' : summary?.thisMonthEarnings || '0.0000'}
                </p>
                <p className="text-base text-[#000080] font-medium">{summary?.currency || 'MATIC'}</p>
                <p className="text-sm text-[#404040] mt-1">This Month</p>
              </div>
            </div>
          </div>

          {/* Sales Count */}
          <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#ffb3d9] shadow-[inset_1px_1px_#808080,0_0_15px_rgba(255,179,217,0.5)] flex items-center justify-center">
                <ArrowUpRight className="w-7 h-7 text-[#000080]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#000080]">
                  {isLoading ? '...' : summary?.totalSalesCount || 0}
                </p>
                <p className="text-sm text-[#404040] mt-1">Sales Made</p>
              </div>
            </div>
          </div>

          {/* Tokens Sold */}
          <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#d4a5ff] shadow-[inset_1px_1px_#808080,0_0_15px_rgba(212,165,255,0.5)] flex items-center justify-center">
                <Coins className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#000080]">
                  {isLoading ? '...' : summary?.totalTokensSold || 0}
                </p>
                <p className="text-sm text-[#404040] mt-1">Tokens Sold</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction History - 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-white text-lg font-bold">Transaction History</span>
                </div>
                <button
                  onClick={fetchEarningsData}
                  disabled={isLoading}
                  className="p-2 hover:bg-white/20 transition-colors"
                >
                  <RefreshCw className={cn('w-5 h-5 text-white', isLoading && 'animate-spin')} />
                </button>
              </div>

              {/* Tab Bar */}
              <div className="bg-[#c3c3c3] border-b border-[#808080] px-3 py-2 flex gap-3">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'sales', label: 'Sales' },
                  { key: 'royalties', label: 'Royalties' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={cn(
                      'px-4 py-2 text-base font-semibold transition-all',
                      activeTab === tab.key
                        ? 'bg-[#000080] text-white shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff]'
                        : 'bg-[#c3c3c3] text-[#000080] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] hover:bg-[#dfdfdf]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-5 bg-gradient-to-b from-[#008b8b] to-[#006b6b] min-h-[400px] max-h-[500px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-6">
                      <Loader2 className="w-10 h-10 text-[#000080] animate-spin mb-3 mx-auto" />
                      <p className="text-black text-lg font-bold">Loading transactions...</p>
                    </div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-8 text-center">
                      <Clock className="w-16 h-16 text-[#808080] mb-4 mx-auto" />
                      <p className="text-black text-xl font-bold mb-2">No transactions yet</p>
                      <p className="text-[#404040] text-base">
                        Start selling your datasets to earn!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={cn(
                                  'px-3 py-1 text-sm font-bold',
                                  tx.earningType === 'sale'
                                    ? 'bg-[#7fff9f] text-[#000080]'
                                    : 'bg-[#d4a5ff] text-white'
                                )}
                              >
                                {tx.earningType.toUpperCase()}
                              </span>
                              <span className="text-base text-[#404040]">
                                {formatDate(tx.createdAt)}
                              </span>
                            </div>
                            <p className="text-lg font-bold text-[#000080] truncate mb-1">
                              {tx.assetName || 'Unknown Dataset'}
                            </p>
                            <p className="text-base text-[#404040]">
                              {tx.tokenAmount} token{tx.tokenAmount !== 1 ? 's' : ''} to{' '}
                              <span className="font-mono">{truncateAddress(tx.buyerAddress)}</span>
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xl font-bold text-[#006b00]">
                              +{tx.earnedAmount} MATIC
                            </p>
                            {tx.transactionHash && (
                              <a
                                href={getExplorerUrl(tx.transactionHash, 'tx')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-base text-[#000080] hover:underline flex items-center gap-1 justify-end mt-1"
                              >
                                View <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div className="bg-[#c3c3c3] border-t-2 border-[#dfdfdf] px-4 py-2">
                <span className="text-[#000080] text-base font-medium shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] px-3 py-1">
                  {summary?.totalTransactions || 0} total transaction{summary?.totalTransactions !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Performing Assets */}
            <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]">
              <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-4 py-2.5 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-[#fff7b3]" />
                <span className="text-white text-lg font-bold">Top Performing Assets</span>
              </div>

              <div className="p-5 bg-gradient-to-b from-[#008b8b] to-[#006b6b] min-h-[300px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-48">
                    <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-5">
                      <Loader2 className="w-8 h-8 text-[#000080] animate-spin mb-2 mx-auto" />
                      <p className="text-black text-base font-bold">Loading...</p>
                    </div>
                  </div>
                ) : topAssets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48">
                    <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-6 text-center">
                      <Database className="w-14 h-14 text-[#808080] mb-3 mx-auto" />
                      <p className="text-black text-lg font-bold mb-1">No sales yet</p>
                      <p className="text-[#404040] text-base">
                        Your top earners will appear here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topAssets.map((asset) => (
                      <div
                        key={asset.assetTokenId || asset.assetId}
                        className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'w-10 h-10 flex items-center justify-center font-bold text-xl flex-shrink-0',
                              asset.rank === 1 && 'bg-[#fff7b3] text-[#000080]',
                              asset.rank === 2 && 'bg-[#c3c3c3] text-[#404040] shadow-[inset_1px_1px_#808080]',
                              asset.rank === 3 && 'bg-[#cd7f32] text-white',
                              asset.rank > 3 && 'bg-[#008b8b] text-white'
                            )}
                          >
                            {asset.rank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-[#000080] truncate">
                              {asset.assetName}
                            </p>
                            <p className="text-sm text-[#404040]">
                              {asset.totalTokensSold} tokens sold
                            </p>
                            <p className="text-lg font-bold text-[#006b00] mt-1">
                              {asset.totalEarned} MATIC
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div className="bg-[#c3c3c3] border-t-2 border-[#dfdfdf] px-4 py-2">
                <span className="text-[#000080] text-base font-medium shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] px-3 py-1">
                  Top {topAssets.length} earner{topAssets.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]">
              <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-4 py-2.5 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-white" />
                <span className="text-white text-lg font-bold">Earnings Breakdown</span>
              </div>

              <div className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 bg-[#7fff9f]" />
                      <span className="text-base text-[#000080]">Sales (92.5%)</span>
                    </div>
                    <span className="text-base font-bold text-[#000080]">
                      {summary?.totalSalesEarnings || '0.0000'} MATIC
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 bg-[#d4a5ff]" />
                      <span className="text-base text-[#000080]">Royalties (5%)</span>
                    </div>
                    <span className="text-base font-bold text-[#000080]">
                      {summary?.totalRoyaltyEarnings || '0.0000'} MATIC
                    </span>
                  </div>
                  <div className="border-t-2 border-[#808080] pt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-[#000080]">Total</span>
                    <span className="text-xl font-bold text-[#006b00]">
                      {summary?.totalEarnings || '0.0000'} MATIC
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#fff7b3] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-[#000080]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#000080] mb-2">How Earnings Work</p>
              <p className="text-base text-[#404040] leading-relaxed">
                When someone purchases access tokens to your dataset, the payment is automatically split:
                <strong> 92.5%</strong> goes to the seller, <strong>5%</strong> goes to the original creator as royalty,
                and <strong>2.5%</strong> is the platform fee. Royalties are paid on all secondary sales too!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
