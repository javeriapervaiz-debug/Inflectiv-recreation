'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Store,
  Coins,
  Settings,
  FolderOpen,
  Loader2,
  Database,
  Search,
  Filter,
  RefreshCw,
  Clock,
  TrendingUp,
  Wallet,
  Trophy,
  ExternalLink,
  User,
  Bell,
  Shield,
  Palette,
  HelpCircle,
  Info,
  Edit3,
} from 'lucide-react';
import { BrowserProvider } from 'ethers';
import { DesktopIcon, DesktopWindow, Taskbar, ListingCard, PurchaseModal, ConnectWallet, MyDataAssets, MintingModal } from '@/components/molecules';
import { IngestionChat } from '@/components/organisms';
import { useWeb3Auth, useAuthSync } from '@/lib/web3auth';
import { getActiveListings, getExplorerUrl, type Listing } from '@/lib/contracts';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import type { ListingData } from '@/components/molecules';

// Asset interface for My Data
interface AssetData {
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

// Define app icons for the desktop
const desktopApps = [
  { id: 'upload', icon: Upload, label: 'Upload Data', color: 'linear-gradient(135deg, #a0e7e5, #7dd3fc)' },
  { id: 'marketplace', icon: Store, label: 'Marketplace', color: 'linear-gradient(135deg, #dbb4f3, #c9a7eb)' },
  { id: 'earnings', icon: Coins, label: 'Earnings', color: 'linear-gradient(135deg, #ffeaa7, #fdcb6e)' },
  { id: 'my-data', icon: FolderOpen, label: 'My Data', color: 'linear-gradient(135deg, #b5ead7, #88d8b0)' },
  { id: 'settings', icon: Settings, label: 'Settings', color: 'linear-gradient(135deg, #ffb5c5, #ff8fab)' },
];

// Window state interface
interface WindowState {
  id: string;
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

// Categories for marketplace
const CATEGORIES = ['All', 'financial', 'legal', 'technical', 'medical', 'research', 'business', 'general'];

// Earnings interfaces
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

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, isInitialized, user, disconnect, getProvider } = useWeb3Auth();
  const { dbUser } = useAuthSync();

  // Window management state
  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'upload', title: 'Upload Data', icon: <Upload className="w-4 h-4" />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    { id: 'marketplace', title: 'Marketplace', icon: <Store className="w-4 h-4" />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    { id: 'earnings', title: 'Earnings', icon: <Coins className="w-4 h-4" />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    { id: 'my-data', title: 'My Data', icon: <FolderOpen className="w-4 h-4" />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    { id: 'settings', title: 'Settings', icon: <Settings className="w-4 h-4" />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  ]);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  // Marketplace state
  const [listings, setListings] = useState<ListingData[]>([]);
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<ListingData | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [walletProvider, setWalletProvider] = useState<BrowserProvider | null>(null);

  // Earnings state
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [topAssets, setTopAssets] = useState<TopAsset[]>([]);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);
  const [earningsTab, setEarningsTab] = useState<'all' | 'sales' | 'royalties'>('all');

  // My Data Assets state
  const [showMintingModal, setShowMintingModal] = useState(false);
  const [assetToMint, setAssetToMint] = useState<AssetData | null>(null);
  const [editingAsset, setEditingAsset] = useState<AssetData | null>(null);

  // Get listed assets from Supabase
  const { data: listedAssets } = trpc.asset.getListed.useQuery(
    { limit: 50, offset: 0, category: selectedCategory !== 'All' ? selectedCategory : undefined },
    { enabled: true }
  );

  // Redirect to auth if not connected
  useEffect(() => {
    if (isInitialized && !isConnected) {
      router.push('/auth');
    }
  }, [isInitialized, isConnected, router]);

  // Initialize wallet provider
  useEffect(() => {
    const initProvider = async () => {
      if (user) {
        const provider = await getProvider();
        setWalletProvider(provider);
      } else {
        setWalletProvider(null);
      }
    };
    initProvider();
  }, [user, getProvider]);

  // Window management functions
  const openWindow = (id: string) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setActiveWindowId(id);
    setWindows(prev => prev.map(w =>
      w.id === id
        ? { ...w, isOpen: true, isMinimized: false, zIndex: newZIndex }
        : w
    ));
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isOpen: false, isMinimized: false, isMaximized: false } : w
    ));
    if (activeWindowId === id) {
      const openWindows = windows.filter(w => w.isOpen && w.id !== id);
      setActiveWindowId(openWindows.length > 0 ? openWindows[openWindows.length - 1].id : null);
    }
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMinimized: true } : w
    ));
    if (activeWindowId === id) {
      const openWindows = windows.filter(w => w.isOpen && !w.isMinimized && w.id !== id);
      setActiveWindowId(openWindows.length > 0 ? openWindows[openWindows.length - 1].id : null);
    }
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  const focusWindow = (id: string) => {
    const window = windows.find(w => w.id === id);
    if (window?.isMinimized) {
      setWindows(prev => prev.map(w =>
        w.id === id ? { ...w, isMinimized: false } : w
      ));
    }
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setActiveWindowId(id);
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, zIndex: newZIndex } : w
    ));
  };

  const handleTaskbarClick = (id: string) => {
    const window = windows.find(w => w.id === id);
    if (!window) return;

    if (window.isMinimized) {
      focusWindow(id);
    } else if (activeWindowId === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  // Handle editing an asset - opens Upload window with asset context
  const handleEditAsset = (asset: AssetData) => {
    setEditingAsset(asset);
    openWindow('upload');
  };

  // Handle minting an asset
  const handleMintAsset = (asset: AssetData) => {
    setAssetToMint(asset);
    setShowMintingModal(true);
  };

  // Handle mint success
  const handleMintSuccess = () => {
    setShowMintingModal(false);
    setAssetToMint(null);
    // Refetch assets to update the list
  };

  // Fetch marketplace listings
  const fetchListings = useCallback(async () => {
    setIsLoadingMarketplace(true);
    try {
      const blockchainListings: Listing[] = await getActiveListings(0, 50);
      const mergedListings: ListingData[] = [];

      if (listedAssets?.assets) {
        for (const asset of listedAssets.assets) {
          const blockchainListing = blockchainListings.find(
            (bl) => asset.blockchain_token_id && bl.datasetTokenId.toString() === asset.blockchain_token_id
          );
          mergedListings.push({
            id: asset.id,
            name: asset.name,
            description: asset.description || '',
            category: asset.category || 'general',
            tokenId: asset.token_id,
            blockchainTokenId: asset.blockchain_token_id,
            creator: asset.user ? { username: asset.user.username, displayName: asset.user.display_name, walletAddress: undefined } : undefined,
            listingId: blockchainListing?.listingId,
            pricePerToken: blockchainListing?.pricePerToken,
            availableTokens: blockchainListing?.availableTokens,
            totalSold: blockchainListing?.totalSold,
          });
        }
      }

      let filteredListings = mergedListings;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredListings = mergedListings.filter(
          (l) => l.name.toLowerCase().includes(query) || l.description.toLowerCase().includes(query) || l.category.toLowerCase().includes(query)
        );
      }
      setListings(filteredListings);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setIsLoadingMarketplace(false);
    }
  }, [listedAssets, searchQuery]);

  // Fetch earnings data
  const fetchEarningsData = useCallback(async () => {
    if (!user?.walletAddress) return;
    setIsLoadingEarnings(true);
    try {
      const [summaryRes, transactionsRes, topAssetsRes] = await Promise.all([
        fetch(`/api/earnings/summary?walletAddress=${user.walletAddress}`),
        fetch(`/api/earnings/transactions?walletAddress=${user.walletAddress}&type=${earningsTab}&limit=10`),
        fetch(`/api/earnings/top-assets?walletAddress=${user.walletAddress}&limit=5`),
      ]);
      const [summaryData, transactionsData, topAssetsData] = await Promise.all([
        summaryRes.json(),
        transactionsRes.json(),
        topAssetsRes.json(),
      ]);
      if (summaryData.success) setSummary(summaryData.data);
      if (transactionsData.success) setTransactions(transactionsData.data.transactions);
      if (topAssetsData.success) setTopAssets(topAssetsData.data.topAssets);
    } catch (err) {
      console.error('Failed to fetch earnings data:', err);
    } finally {
      setIsLoadingEarnings(false);
    }
  }, [user?.walletAddress, earningsTab]);

  // Fetch data when windows are opened
  useEffect(() => {
    const marketplaceWindow = windows.find(w => w.id === 'marketplace');
    if (marketplaceWindow?.isOpen) {
      fetchListings();
    }
  }, [windows.find(w => w.id === 'marketplace')?.isOpen, fetchListings]);

  useEffect(() => {
    const earningsWindow = windows.find(w => w.id === 'earnings');
    if (earningsWindow?.isOpen && user?.walletAddress) {
      fetchEarningsData();
    }
  }, [windows.find(w => w.id === 'earnings')?.isOpen, fetchEarningsData, user?.walletAddress]);

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  // Loading state
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center desktop-background">
        <div className="bg-[#f5f0f7] shadow-[0_8px_32px_rgba(139,123,168,0.25),inset_-1px_-1px_#b8a8c5,inset_1px_1px_#ffffff] p-10 text-center rounded-lg">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#8b7ba8]" />
          <p className="text-[#3d3d3d] text-xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) return null;

  // Check if any window is maximized
  const hasMaximizedWindow = windows.some(w => w.isOpen && w.isMaximized && !w.isMinimized);

  return (
    <div className="min-h-screen desktop-background overflow-hidden">
      {/* Desktop Grid Background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Desktop Icons Area - Hidden when a window is maximized */}
      {!hasMaximizedWindow && (
        <div className="fixed top-4 left-4 grid grid-cols-1 gap-2 z-10">
          {desktopApps.map((app) => (
            <DesktopIcon
              key={app.id}
              icon={app.icon}
              label={app.label}
              color={app.color}
              onClick={() => openWindow(app.id)}
              isSelected={activeWindowId === app.id}
            />
          ))}
        </div>
      )}

      {/* User Info Widget - Top Right - Hidden when a window is maximized */}
      {!hasMaximizedWindow && (
        <div className="fixed top-4 right-4 z-10">
          <div className="bg-[#f5f0f7]/90 backdrop-blur-sm rounded-lg shadow-[0_4px_16px_rgba(139,123,168,0.2),inset_-1px_-1px_#b8a8c5,inset_1px_1px_#ffffff] p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b4a7d6] to-[#d5a6bd] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3d3d3d]">{user?.name || 'User'}</p>
                <p className="text-xs text-[#8b7b9b] font-mono">
                  {user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}
                </p>
              </div>
              <ConnectWallet />
            </div>
          </div>
        </div>
      )}

      {/* Windows */}
      {windows.map((window) => (
        <DesktopWindow
          key={window.id}
          id={window.id}
          title={window.title}
          icon={window.icon}
          isOpen={window.isOpen}
          isMinimized={window.isMinimized}
          isMaximized={window.isMaximized}
          zIndex={window.zIndex}
          defaultWidth={window.id === 'upload' ? 900 : window.id === 'marketplace' ? 1000 : window.id === 'earnings' ? 1000 : 600}
          defaultHeight={window.id === 'upload' ? 650 : window.id === 'marketplace' ? 700 : window.id === 'earnings' ? 700 : 500}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onFocus={() => focusWindow(window.id)}
        >
          {/* Upload Data Window Content */}
          {window.id === 'upload' && (
            <div className="h-full p-4">
              {/* Show editing banner if editing an asset */}
              {editingAsset && (
                <div className="mb-3 p-3 bg-[#dbb4f3]/20 rounded-lg border border-[#dbb4f3]/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-[#8b7ba8]" />
                      <span className="text-sm font-medium text-[#3d3d3d]">
                        Editing: <span className="text-[#8b7ba8]">{editingAsset.name}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingAsset(null)}
                      className="text-xs px-2 py-1 bg-white/50 rounded hover:bg-white/70 transition-colors text-[#5a5a5a]"
                    >
                      Clear
                    </button>
                  </div>
                  {editingAsset.description && (
                    <p className="text-xs text-[#8b7b9b] mt-1 line-clamp-1">{editingAsset.description}</p>
                  )}
                </div>
              )}
              <div className={cn(
                "bg-gradient-to-br from-[#a8e6cf]/20 to-[#b5ead7]/20 rounded-lg p-4",
                editingAsset ? "h-[calc(100%-70px)]" : "h-full"
              )}>
                <IngestionChat
                  userId={(dbUser as { id: string } | null)?.id}
                  editingAsset={editingAsset ? {
                    id: editingAsset.id,
                    name: editingAsset.name,
                    description: editingAsset.description || '',
                    tokenId: editingAsset.token_id,
                  } : undefined}
                />
              </div>
            </div>
          )}

          {/* Marketplace Window Content */}
          {window.id === 'marketplace' && (
            <div className="h-full flex flex-col">
              {/* Search and Filter */}
              <div className="p-4 border-b border-[#e8e0ed]">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-white rounded-lg shadow-[inset_1px_1px_#d5c8de] px-3 py-2">
                    <Search className="w-4 h-4 text-[#8b7b9b]" />
                    <input
                      type="text"
                      placeholder="Search datasets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent focus:outline-none text-[#3d3d3d] text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-[#8b7b9b]" />
                    {CATEGORIES.slice(0, 5).map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded-full transition-all capitalize',
                          selectedCategory === category
                            ? 'bg-[#b4a7d6] text-white'
                            : 'bg-[#f5f0f7] text-[#5a5a5a] hover:bg-[#e8e0ed]'
                        )}
                      >
                        {category}
                      </button>
                    ))}
                    <button
                      onClick={fetchListings}
                      disabled={isLoadingMarketplace}
                      className="p-1.5 rounded-lg bg-[#f5f0f7] hover:bg-[#e8e0ed] transition-colors"
                    >
                      <RefreshCw className={cn('w-4 h-4 text-[#8b7b9b]', isLoadingMarketplace && 'animate-spin')} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Listings Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingMarketplace ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-[#8b7ba8]" />
                  </div>
                ) : listings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Store className="w-16 h-16 text-[#d5c8de] mb-3" />
                    <p className="text-[#5a5a5a] font-medium">No listings found</p>
                    <p className="text-sm text-[#8b7b9b]">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        onPurchase={(l) => { setSelectedListing(l); setShowPurchaseModal(true); }}
                        onViewDetails={(l) => console.log('View details:', l)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Earnings Window Content */}
          {window.id === 'earnings' && (
            <div className="h-full flex flex-col overflow-y-auto">
              {/* Stats Cards */}
              <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#b5ead7]/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 text-[#88d8b0]" />
                    <span className="text-xs text-[#5a5a5a]">Total Earned</span>
                  </div>
                  <p className="text-lg font-bold text-[#3d3d3d]">{summary?.totalEarnings || '0.0000'}</p>
                  <p className="text-xs text-[#8b7b9b]">{summary?.currency || 'MATIC'}</p>
                </div>
                <div className="bg-[#a8d8ea]/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-[#7dd3fc]" />
                    <span className="text-xs text-[#5a5a5a]">This Month</span>
                  </div>
                  <p className="text-lg font-bold text-[#3d3d3d]">{summary?.thisMonthEarnings || '0.0000'}</p>
                  <p className="text-xs text-[#8b7b9b]">{summary?.currency || 'MATIC'}</p>
                </div>
                <div className="bg-[#ffb5c5]/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-[#ff8fab]" />
                    <span className="text-xs text-[#5a5a5a]">Sales</span>
                  </div>
                  <p className="text-lg font-bold text-[#3d3d3d]">{summary?.totalSalesCount || 0}</p>
                </div>
                <div className="bg-[#dbb4f3]/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-4 h-4 text-[#c9a7eb]" />
                    <span className="text-xs text-[#5a5a5a]">Tokens Sold</span>
                  </div>
                  <p className="text-lg font-bold text-[#3d3d3d]">{summary?.totalTokensSold || 0}</p>
                </div>
              </div>

              {/* Transactions */}
              <div className="flex-1 p-4 pt-0">
                <div className="bg-white/50 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-[#f5f0f7] border-b border-[#e8e0ed] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#8b7ba8]" />
                      <span className="font-medium text-sm text-[#3d3d3d]">Transaction History</span>
                    </div>
                    <div className="flex gap-1">
                      {['all', 'sales', 'royalties'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setEarningsTab(tab as typeof earningsTab)}
                          className={cn(
                            'px-2 py-1 text-xs rounded transition-all capitalize',
                            earningsTab === tab ? 'bg-[#b4a7d6] text-white' : 'text-[#5a5a5a] hover:bg-[#e8e0ed]'
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {isLoadingEarnings ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-[#8b7ba8]" />
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-center">
                        <Clock className="w-10 h-10 text-[#d5c8de] mb-2" />
                        <p className="text-sm text-[#5a5a5a]">No transactions yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#e8e0ed]">
                        {transactions.map((tx) => (
                          <div key={tx.id} className="p-3 hover:bg-[#f5f0f7]/50">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={cn(
                                    'px-2 py-0.5 text-xs font-medium rounded',
                                    tx.earningType === 'sale' ? 'bg-[#b5ead7] text-[#3d3d3d]' : 'bg-[#dbb4f3] text-[#3d3d3d]'
                                  )}>
                                    {tx.earningType.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-[#8b7b9b]">{formatDate(tx.createdAt)}</span>
                                </div>
                                <p className="text-sm font-medium text-[#3d3d3d] truncate">{tx.assetName || 'Unknown'}</p>
                                <p className="text-xs text-[#8b7b9b]">{tx.tokenAmount} token(s) to {truncateAddress(tx.buyerAddress)}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-[#88d8b0]">+{tx.earnedAmount}</p>
                                {tx.transactionHash && (
                                  <a href={getExplorerUrl(tx.transactionHash, 'tx')} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-[#8b7ba8] hover:underline flex items-center gap-1 justify-end">
                                    View <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Assets */}
                {topAssets.length > 0 && (
                  <div className="mt-4 bg-white/50 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-[#f5f0f7] border-b border-[#e8e0ed] flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#fdcb6e]" />
                      <span className="font-medium text-sm text-[#3d3d3d]">Top Performing</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {topAssets.slice(0, 3).map((asset) => (
                        <div key={asset.assetId} className="flex items-center gap-3 p-2 bg-[#f5f0f7]/50 rounded">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                            asset.rank === 1 ? 'bg-[#ffeaa7] text-[#3d3d3d]' : asset.rank === 2 ? 'bg-[#e8e0ed] text-[#5a5a5a]' : 'bg-[#ffd1b3] text-[#3d3d3d]'
                          )}>
                            {asset.rank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#3d3d3d] truncate">{asset.assetName}</p>
                            <p className="text-xs text-[#8b7b9b]">{asset.totalTokensSold} sold</p>
                          </div>
                          <p className="text-sm font-bold text-[#88d8b0]">{asset.totalEarned}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Data Window Content */}
          {window.id === 'my-data' && (
            <MyDataAssets
              userId={(dbUser as { id: string } | null)?.id}
              onEditAsset={handleEditAsset}
              onMintAsset={handleMintAsset}
            />
          )}

          {/* Settings Window Content */}
          {window.id === 'settings' && (
            <div className="h-full p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b4a7d6] to-[#d5a6bd] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3d3d3d]">Profile</h3>
                      <p className="text-sm text-[#8b7b9b]">Manage your account settings</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-[#e8e0ed]">
                      <span className="text-[#5a5a5a]">Name</span>
                      <span className="text-[#3d3d3d] font-medium">{user?.name || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#e8e0ed]">
                      <span className="text-[#5a5a5a]">Email</span>
                      <span className="text-[#3d3d3d] font-medium">{user?.email || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-[#5a5a5a]">Wallet</span>
                      <span className="text-[#3d3d3d] font-mono text-xs">{user?.walletAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                    <Bell className="w-5 h-5 text-[#8b7ba8]" />
                    <span className="text-sm text-[#3d3d3d]">Notifications</span>
                  </button>
                  <button className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                    <Shield className="w-5 h-5 text-[#8b7ba8]" />
                    <span className="text-sm text-[#3d3d3d]">Security</span>
                  </button>
                  <button className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                    <Palette className="w-5 h-5 text-[#8b7ba8]" />
                    <span className="text-sm text-[#3d3d3d]">Appearance</span>
                  </button>
                  <button className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                    <HelpCircle className="w-5 h-5 text-[#8b7ba8]" />
                    <span className="text-sm text-[#3d3d3d]">Help</span>
                  </button>
                </div>

                <div className="bg-[#ffb7b2]/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-[#ff8fab]" />
                    <div>
                      <p className="text-sm font-medium text-[#3d3d3d]">About Inflectiv</p>
                      <p className="text-xs text-[#8b7b9b]">Version 1.0.0 - Web3 Data Marketplace</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DesktopWindow>
      ))}

      {/* Taskbar */}
      <Taskbar
        windows={windows.filter(w => w.isOpen).map(w => ({
          id: w.id,
          title: w.title,
          icon: w.icon,
          isMinimized: w.isMinimized,
        }))}
        activeWindowId={activeWindowId}
        onWindowClick={handleTaskbarClick}
        userName={user?.name || 'User'}
        onLogout={() => {
          disconnect();
          router.push('/');
        }}
      />

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => { setShowPurchaseModal(false); setSelectedListing(null); }}
        listing={selectedListing}
        provider={walletProvider}
        walletAddress={user?.walletAddress || ''}
        onPurchaseSuccess={fetchListings}
      />

      {/* Minting Modal for My Data Assets */}
      {assetToMint && (
        <MintingModal
          isOpen={showMintingModal}
          onClose={() => { setShowMintingModal(false); setAssetToMint(null); }}
          assetId={assetToMint.id}
          name={assetToMint.name}
          description={assetToMint.description || ''}
          category={assetToMint.category || 'general'}
          tokenId={assetToMint.token_id}
          provider={walletProvider}
          walletAddress={user?.walletAddress || ''}
          onMintSuccess={handleMintSuccess}
        />
      )}
    </div>
  );
}
