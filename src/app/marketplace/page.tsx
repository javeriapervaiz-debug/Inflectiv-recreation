'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Store,
  ChevronLeft,
  Database,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { BrowserProvider } from 'ethers';
import { ListingCard, PurchaseModal, ConnectWallet } from '@/components/molecules';
import type { ListingData } from '@/components/molecules';
import { useWeb3Auth } from '@/lib/web3auth';
import { getActiveListings, type Listing } from '@/lib/contracts';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';

const CATEGORIES = [
  'All',
  'financial',
  'legal',
  'technical',
  'medical',
  'research',
  'business',
  'general',
];

export default function MarketplacePage() {
  const [listings, setListings] = useState<ListingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<ListingData | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [walletProvider, setWalletProvider] = useState<BrowserProvider | null>(null);

  const { user, isConnected, getProvider } = useWeb3Auth();

  // Get listed assets from Supabase
  const { data: listedAssets } = trpc.asset.getListed.useQuery(
    {
      limit: 50,
      offset: 0,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
    },
    { enabled: true }
  );

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

  // Fetch blockchain listings and merge with Supabase data
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get blockchain listings
      const blockchainListings: Listing[] = await getActiveListings(0, 50);

      // Merge with Supabase data
      const mergedListings: ListingData[] = [];

      if (listedAssets?.assets) {
        for (const asset of listedAssets.assets) {
          // Find matching blockchain listing
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
            creator: asset.user
              ? {
                  username: asset.user.username,
                  displayName: asset.user.display_name,
                  walletAddress: undefined,
                }
              : undefined,
            listingId: blockchainListing?.listingId,
            pricePerToken: blockchainListing?.pricePerToken,
            availableTokens: blockchainListing?.availableTokens,
            totalSold: blockchainListing?.totalSold,
          });
        }
      }

      // Filter by search query
      let filteredListings = mergedListings;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredListings = mergedListings.filter(
          (l) =>
            l.name.toLowerCase().includes(query) ||
            l.description.toLowerCase().includes(query) ||
            l.category.toLowerCase().includes(query)
        );
      }

      setListings(filteredListings);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError('Failed to load marketplace listings');
    } finally {
      setIsLoading(false);
    }
  }, [listedAssets, searchQuery]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handlePurchase = (listing: ListingData) => {
    setSelectedListing(listing);
    setShowPurchaseModal(true);
  };

  const handleViewDetails = (listing: ListingData) => {
    // TODO: Navigate to dataset details page
    console.log('View details:', listing);
  };

  const handlePurchaseSuccess = () => {
    // Refresh listings after successful purchase
    fetchListings();
  };

  return (
    <div className="min-h-screen">
      {/* Background with softer gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#1e1233] via-[#2a1f4e] to-[#3d2d6b]" />
      <div className="fixed inset-0 grid-pattern opacity-30" />

      {/* Decorative elements inspired by the reference image */}
      <div className="fixed top-20 left-10 w-24 h-24 decorative-sphere opacity-40 animate-float" />
      <div className="fixed bottom-40 right-16 w-16 h-16 decorative-sphere opacity-30 animate-float" style={{ animationDelay: '1s' }} />
      <div className="fixed top-1/3 right-20 w-32 h-32 decorative-ring opacity-20 animate-float" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header Window */}
        <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] mb-8">
          {/* Title Bar */}
          <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="w-6 h-6 text-[#fff7b3]" />
              <span className="text-white text-xl font-bold tracking-wide">
                Data Marketplace
              </span>
              <span className="text-white/70 text-lg">- INFLECTIV.exe</span>
            </div>
            <div className="flex items-center gap-4">
              <ConnectWallet />
              <div className="flex gap-1">
                <span className="w-5 h-5 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff] text-sm flex items-center justify-center font-bold">
                  _
                </span>
                <span className="w-5 h-5 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff] text-sm flex items-center justify-center font-bold">
                  □
                </span>
                <span className="w-5 h-5 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff] text-sm flex items-center justify-center font-bold">
                  ×
                </span>
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
            <span className="text-[#000080] text-base font-medium hover:bg-[#000080] hover:text-white px-2 py-1 cursor-pointer transition-colors">
              Browse
            </span>
            <span className="text-[#000080] text-base font-medium hover:bg-[#000080] hover:text-white px-2 py-1 cursor-pointer transition-colors">
              My Purchases
            </span>
            <span className="text-[#000080] text-base font-medium hover:bg-[#000080] hover:text-white px-2 py-1 cursor-pointer transition-colors">
              My Listings
            </span>
          </div>

          {/* Description */}
          <div className="p-5 text-black">
            <p className="text-lg leading-relaxed">
              Browse and purchase access to high-quality datasets. Each access token grants you
              unlimited access to the dataset.
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex items-center gap-3 bg-white shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff,inset_2px_2px_#404040] px-4 py-3">
              <Search className="w-5 h-5 text-[#808080]" />
              <input
                type="text"
                placeholder="Search datasets by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent focus:outline-none text-[#000080] text-lg placeholder:text-[#808080]"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#808080]" />
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'px-4 py-2 text-base font-semibold transition-all capitalize',
                      selectedCategory === category
                        ? 'bg-[#000080] text-white shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff]'
                        : 'bg-[#c3c3c3] text-[#000080] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] hover:bg-[#dfdfdf]'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchListings}
              disabled={isLoading}
              className="px-4 py-3 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] font-bold hover:bg-[#dfdfdf] active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#ffffff] disabled:opacity-50 transition-all"
            >
              <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf]">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-white" />
              <span className="text-white text-lg font-bold">
                Available Datasets
              </span>
              <span className="px-3 py-1 bg-[#fff7b3] text-[#000080] text-base font-bold shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff]">
                {listings.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#7fff9f] shadow-[0_0_8px_#7fff9f] animate-pulse rounded-sm" />
              <span className="text-[#7fff9f] text-base font-semibold">LIVE</span>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 bg-gradient-to-b from-[#008b8b] to-[#006b6b] min-h-[500px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-80">
                <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-8">
                  <Loader2 className="w-16 h-16 text-[#000080] animate-spin mb-4 mx-auto" />
                  <p className="text-black text-xl font-bold text-center">Loading marketplace...</p>
                  <p className="text-[#404040] text-base text-center mt-2">Fetching available datasets</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-80">
                <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-8 text-center">
                  <p className="text-[#cc0000] text-xl font-bold mb-4">{error}</p>
                  <button
                    onClick={fetchListings}
                    className="px-6 py-3 bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] text-[#000080] text-lg font-bold hover:bg-[#dfdfdf] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80">
                <div className="bg-[#c3c3c3] shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] p-10 text-center">
                  <ShoppingBag className="w-20 h-20 text-[#808080] mb-4 mx-auto" />
                  <p className="text-black text-2xl font-bold mb-2">No listings found</p>
                  <p className="text-[#404040] text-lg">
                    {searchQuery
                      ? 'Try adjusting your search or category filter'
                      : 'Be the first to list a dataset on the marketplace!'}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-[#000080]">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-base">Create your first dataset in the Dashboard</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onPurchase={handlePurchase}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="bg-[#c3c3c3] border-t-2 border-[#dfdfdf] px-4 py-2 flex items-center justify-between">
            <span className="text-[#000080] text-base font-medium shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] px-3 py-1">
              {listings.length} dataset{listings.length !== 1 ? 's' : ''} available
            </span>
            <span className="text-[#000080] text-base font-medium shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#ffffff] px-3 py-1">
              Category: <strong>{selectedCategory}</strong> | Network: <strong>Polygon Amoy</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
        provider={walletProvider}
        walletAddress={user?.walletAddress || ''}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </div>
  );
}
