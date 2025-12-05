/**
 * Mock data for earnings dashboard demo
 * Enable by setting USE_MOCK_DATA=true in environment
 */

// Generate realistic transaction hashes
const generateTxHash = (index: number) =>
  `0x${index.toString(16).padStart(4, '0')}${'a'.repeat(60)}`;

// Generate wallet addresses
const generateAddress = (seed: string) =>
  `0x${seed.padStart(40, '0').slice(0, 40)}`;

// Demo user's wallet address (the "seller" - your demo account)
export const MOCK_SELLER_ADDRESS = '0xDEMO000000000000000000000000000000000001';

// Buyer addresses for transactions
const BUYER_ADDRESSES = [
  generateAddress('buyer001'),
  generateAddress('buyer002'),
  generateAddress('buyer003'),
  generateAddress('buyer004'),
  generateAddress('buyer005'),
  generateAddress('buyer006'),
  generateAddress('buyer007'),
  generateAddress('buyer008'),
];

// Mock assets data
export const MOCK_ASSETS = [
  {
    id: '00000001-0001-0001-0001-000000000001',
    name: 'Financial Market Analysis Q4 2024',
    tokenId: 'INFL-847291',
    blockchainTokenId: '1',
    category: 'financial',
    description: 'Comprehensive analysis of Q4 2024 market trends including equities, bonds, and cryptocurrency movements.',
  },
  {
    id: '00000002-0002-0002-0002-000000000002',
    name: 'Healthcare Research Dataset',
    tokenId: 'INFL-293847',
    blockchainTokenId: '2',
    category: 'medical',
    description: 'Anonymized patient outcome data from clinical trials for AI/ML training purposes.',
  },
  {
    id: '00000003-0003-0003-0003-000000000003',
    name: 'Legal Contracts Template Library',
    tokenId: 'INFL-582910',
    blockchainTokenId: '3',
    category: 'legal',
    description: 'Curated collection of legal contract templates for business and commercial use.',
  },
  {
    id: '00000004-0004-0004-0004-000000000004',
    name: 'E-Commerce Customer Behavior',
    tokenId: 'INFL-129384',
    blockchainTokenId: '4',
    category: 'business',
    description: 'Shopping patterns and customer journey analytics from major retail platforms.',
  },
  {
    id: '00000005-0005-0005-0005-000000000005',
    name: 'Climate Research Metrics 2020-2024',
    tokenId: 'INFL-674520',
    blockchainTokenId: '5',
    category: 'research',
    description: 'Environmental sensor data and climate measurements from 50+ research stations.',
  },
];

// Generate dates spread across last 60 days
const generateDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
};

// Transaction amounts in MATIC (realistic marketplace prices)
const PRICE_TIERS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 5.0];

// Calculate revenue split
const calculateSplit = (totalPrice: number) => ({
  seller: (totalPrice * 0.925).toFixed(4),    // 92.5%
  royalty: (totalPrice * 0.05).toFixed(4),    // 5%
  platform: (totalPrice * 0.025).toFixed(4),  // 2.5%
  total: totalPrice.toFixed(4),
});

export interface MockTransaction {
  id: string;
  transactionHash: string;
  blockNumber: number;
  assetId: string;
  assetName: string;
  assetTokenId: string;
  blockchainTokenId: string;
  listingId: string;
  sellerAddress: string;
  buyerAddress: string;
  creatorAddress: string;
  totalAmount: string;
  sellerAmount: string;
  platformFee: string;
  royaltyAmount: string;
  tokenAmount: number;
  pricePerToken: string;
  earningType: 'sale' | 'royalty';
  earnedAmount: string;
  chainId: number;
  status: string;
  createdAt: string;
}

// Generate 18 mock transactions spread across assets and time
export const MOCK_TRANSACTIONS: MockTransaction[] = [
  // === FINANCIAL DATASET (Best Seller - 6 sales) ===
  {
    id: 'tx-001-0001-0001-0001-000000000001',
    transactionHash: generateTxHash(1),
    blockNumber: 1000001,
    assetId: MOCK_ASSETS[0].id,
    assetName: MOCK_ASSETS[0].name,
    assetTokenId: MOCK_ASSETS[0].tokenId,
    blockchainTokenId: MOCK_ASSETS[0].blockchainTokenId,
    listingId: '1',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[0],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(2.5);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 5,
    pricePerToken: '0.5000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(2),
  },
  {
    id: 'tx-002-0002-0002-0002-000000000002',
    transactionHash: generateTxHash(2),
    blockNumber: 1000015,
    assetId: MOCK_ASSETS[0].id,
    assetName: MOCK_ASSETS[0].name,
    assetTokenId: MOCK_ASSETS[0].tokenId,
    blockchainTokenId: MOCK_ASSETS[0].blockchainTokenId,
    listingId: '1',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[1],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(5.0);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 10,
    pricePerToken: '0.5000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(5),
  },
  {
    id: 'tx-003-0003-0003-0003-000000000003',
    transactionHash: generateTxHash(3),
    blockNumber: 1000030,
    assetId: MOCK_ASSETS[0].id,
    assetName: MOCK_ASSETS[0].name,
    assetTokenId: MOCK_ASSETS[0].tokenId,
    blockchainTokenId: MOCK_ASSETS[0].blockchainTokenId,
    listingId: '1',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[2],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(1.0);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 2,
    pricePerToken: '0.5000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(8),
  },
  {
    id: 'tx-004-0004-0004-0004-000000000004',
    transactionHash: generateTxHash(4),
    blockNumber: 1000045,
    assetId: MOCK_ASSETS[0].id,
    assetName: MOCK_ASSETS[0].name,
    assetTokenId: MOCK_ASSETS[0].tokenId,
    blockchainTokenId: MOCK_ASSETS[0].blockchainTokenId,
    listingId: '1',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[3],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(3.0);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 6,
    pricePerToken: '0.5000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(15),
  },
  {
    id: 'tx-005-0005-0005-0005-000000000005',
    transactionHash: generateTxHash(5),
    blockNumber: 1000060,
    assetId: MOCK_ASSETS[0].id,
    assetName: MOCK_ASSETS[0].name,
    assetTokenId: MOCK_ASSETS[0].tokenId,
    blockchainTokenId: MOCK_ASSETS[0].blockchainTokenId,
    listingId: '1',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[4],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(2.0);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 4,
    pricePerToken: '0.5000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(22),
  },
  {
    id: 'tx-006-0006-0006-0006-000000000006',
    transactionHash: generateTxHash(6),
    blockNumber: 1000075,
    assetId: MOCK_ASSETS[0].id,
    assetName: MOCK_ASSETS[0].name,
    assetTokenId: MOCK_ASSETS[0].tokenId,
    blockchainTokenId: MOCK_ASSETS[0].blockchainTokenId,
    listingId: '1',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[5],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(1.5);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 3,
    pricePerToken: '0.5000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(30),
  },

  // === HEALTHCARE DATASET (4 sales) ===
  {
    id: 'tx-007-0007-0007-0007-000000000007',
    transactionHash: generateTxHash(7),
    blockNumber: 1000100,
    assetId: MOCK_ASSETS[1].id,
    assetName: MOCK_ASSETS[1].name,
    assetTokenId: MOCK_ASSETS[1].tokenId,
    blockchainTokenId: MOCK_ASSETS[1].blockchainTokenId,
    listingId: '2',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[0],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(7.5);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 5,
    pricePerToken: '1.5000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(3),
  },
  {
    id: 'tx-008-0008-0008-0008-000000000008',
    transactionHash: generateTxHash(8),
    blockNumber: 1000115,
    assetId: MOCK_ASSETS[1].id,
    assetName: MOCK_ASSETS[1].name,
    assetTokenId: MOCK_ASSETS[1].tokenId,
    blockchainTokenId: MOCK_ASSETS[1].blockchainTokenId,
    listingId: '2',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[2],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(3.0);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 2,
    pricePerToken: '1.5000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(12),
  },
  {
    id: 'tx-009-0009-0009-0009-000000000009',
    transactionHash: generateTxHash(9),
    blockNumber: 1000130,
    assetId: MOCK_ASSETS[1].id,
    assetName: MOCK_ASSETS[1].name,
    assetTokenId: MOCK_ASSETS[1].tokenId,
    blockchainTokenId: MOCK_ASSETS[1].blockchainTokenId,
    listingId: '2',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[4],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(4.5);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 3,
    pricePerToken: '1.5000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(25),
  },
  {
    id: 'tx-010-0010-0010-0010-000000000010',
    transactionHash: generateTxHash(10),
    blockNumber: 1000145,
    assetId: MOCK_ASSETS[1].id,
    assetName: MOCK_ASSETS[1].name,
    assetTokenId: MOCK_ASSETS[1].tokenId,
    blockchainTokenId: MOCK_ASSETS[1].blockchainTokenId,
    listingId: '2',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[6],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(6.0);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 4,
    pricePerToken: '1.5000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(40),
  },

  // === LEGAL CONTRACTS (3 sales) ===
  {
    id: 'tx-011-0011-0011-0011-000000000011',
    transactionHash: generateTxHash(11),
    blockNumber: 1000200,
    assetId: MOCK_ASSETS[2].id,
    assetName: MOCK_ASSETS[2].name,
    assetTokenId: MOCK_ASSETS[2].tokenId,
    blockchainTokenId: MOCK_ASSETS[2].blockchainTokenId,
    listingId: '3',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[1],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(2.0);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 2,
    pricePerToken: '1.0000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(7),
  },
  {
    id: 'tx-012-0012-0012-0012-000000000012',
    transactionHash: generateTxHash(12),
    blockNumber: 1000215,
    assetId: MOCK_ASSETS[2].id,
    assetName: MOCK_ASSETS[2].name,
    assetTokenId: MOCK_ASSETS[2].tokenId,
    blockchainTokenId: MOCK_ASSETS[2].blockchainTokenId,
    listingId: '3',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[3],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(5.0);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 5,
    pricePerToken: '1.0000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(18),
  },
  {
    id: 'tx-013-0013-0013-0013-000000000013',
    transactionHash: generateTxHash(13),
    blockNumber: 1000230,
    assetId: MOCK_ASSETS[2].id,
    assetName: MOCK_ASSETS[2].name,
    assetTokenId: MOCK_ASSETS[2].tokenId,
    blockchainTokenId: MOCK_ASSETS[2].blockchainTokenId,
    listingId: '3',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[5],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(3.0);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 3,
    pricePerToken: '1.0000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(35),
  },

  // === E-COMMERCE DATASET (3 sales) ===
  {
    id: 'tx-014-0014-0014-0014-000000000014',
    transactionHash: generateTxHash(14),
    blockNumber: 1000300,
    assetId: MOCK_ASSETS[3].id,
    assetName: MOCK_ASSETS[3].name,
    assetTokenId: MOCK_ASSETS[3].tokenId,
    blockchainTokenId: MOCK_ASSETS[3].blockchainTokenId,
    listingId: '4',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[0],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(1.5);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 2,
    pricePerToken: '0.7500',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(4),
  },
  {
    id: 'tx-015-0015-0015-0015-000000000015',
    transactionHash: generateTxHash(15),
    blockNumber: 1000315,
    assetId: MOCK_ASSETS[3].id,
    assetName: MOCK_ASSETS[3].name,
    assetTokenId: MOCK_ASSETS[3].tokenId,
    blockchainTokenId: MOCK_ASSETS[3].blockchainTokenId,
    listingId: '4',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[2],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(3.75);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 5,
    pricePerToken: '0.7500',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(20),
  },
  {
    id: 'tx-016-0016-0016-0016-000000000016',
    transactionHash: generateTxHash(16),
    blockNumber: 1000330,
    assetId: MOCK_ASSETS[3].id,
    assetName: MOCK_ASSETS[3].name,
    assetTokenId: MOCK_ASSETS[3].tokenId,
    blockchainTokenId: MOCK_ASSETS[3].blockchainTokenId,
    listingId: '4',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[7],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(2.25);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 3,
    pricePerToken: '0.7500',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(45),
  },

  // === CLIMATE RESEARCH (2 sales) ===
  {
    id: 'tx-017-0017-0017-0017-000000000017',
    transactionHash: generateTxHash(17),
    blockNumber: 1000400,
    assetId: MOCK_ASSETS[4].id,
    assetName: MOCK_ASSETS[4].name,
    assetTokenId: MOCK_ASSETS[4].tokenId,
    blockchainTokenId: MOCK_ASSETS[4].blockchainTokenId,
    listingId: '5',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[1],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(4.0);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 2,
    pricePerToken: '2.0000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(10),
  },
  {
    id: 'tx-018-0018-0018-0018-000000000018',
    transactionHash: generateTxHash(18),
    blockNumber: 1000415,
    assetId: MOCK_ASSETS[4].id,
    assetName: MOCK_ASSETS[4].name,
    assetTokenId: MOCK_ASSETS[4].tokenId,
    blockchainTokenId: MOCK_ASSETS[4].blockchainTokenId,
    listingId: '5',
    sellerAddress: MOCK_SELLER_ADDRESS,
    buyerAddress: BUYER_ADDRESSES[4],
    creatorAddress: MOCK_SELLER_ADDRESS,
    ...(() => {
      const split = calculateSplit(6.0);
      return {
        totalAmount: split.total,
        sellerAmount: split.seller,
        platformFee: split.platform,
        royaltyAmount: split.royalty,
        earnedAmount: split.seller,
      };
    })(),
    tokenAmount: 3,
    pricePerToken: '2.0000',
    earningType: 'sale',
    chainId: 80002,
    status: 'confirmed',
    createdAt: generateDate(28),
  },
];

// Calculate summary from transactions
export function getMockEarningsSummary() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let totalSalesEarnings = 0;
  let totalRoyaltyEarnings = 0;
  let thisMonthEarnings = 0;
  let totalTokensSold = 0;
  let salesCount = 0;
  let royaltiesCount = 0;

  for (const tx of MOCK_TRANSACTIONS) {
    const earnedAmount = parseFloat(tx.earnedAmount);
    const txDate = new Date(tx.createdAt);

    if (tx.earningType === 'sale') {
      totalSalesEarnings += earnedAmount;
      salesCount++;
    } else {
      totalRoyaltyEarnings += earnedAmount;
      royaltiesCount++;
    }

    totalTokensSold += tx.tokenAmount;

    if (txDate >= startOfMonth) {
      thisMonthEarnings += earnedAmount;
    }
  }

  return {
    totalEarnings: (totalSalesEarnings + totalRoyaltyEarnings).toFixed(4),
    totalSalesEarnings: totalSalesEarnings.toFixed(4),
    totalRoyaltyEarnings: totalRoyaltyEarnings.toFixed(4),
    thisMonthEarnings: thisMonthEarnings.toFixed(4),
    totalTransactions: MOCK_TRANSACTIONS.length,
    totalSalesCount: salesCount,
    totalRoyaltiesCount: royaltiesCount,
    totalTokensSold,
    currency: 'MATIC',
  };
}

// Get transactions with filtering and pagination
export function getMockTransactions(
  type: 'all' | 'sale' | 'royalty' = 'all',
  limit = 20,
  offset = 0
) {
  let filtered = [...MOCK_TRANSACTIONS];

  if (type !== 'all') {
    filtered = filtered.filter((tx) => tx.earningType === type);
  }

  // Sort by date descending
  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    transactions: paginated.map((tx) => ({
      id: tx.id,
      transactionHash: tx.transactionHash,
      assetName: tx.assetName,
      assetTokenId: tx.assetTokenId,
      earningType: tx.earningType,
      earnedAmount: tx.earnedAmount,
      totalAmount: tx.totalAmount,
      tokenAmount: tx.tokenAmount,
      buyerAddress: tx.buyerAddress,
      createdAt: tx.createdAt,
      chainId: tx.chainId,
    })),
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}

// Get top performing assets
export function getMockTopAssets(limit = 5) {
  // Group transactions by asset
  const assetMap = new Map<
    string,
    {
      assetId: string;
      assetName: string;
      assetTokenId: string;
      totalEarned: number;
      totalTokensSold: number;
      transactionCount: number;
    }
  >();

  for (const tx of MOCK_TRANSACTIONS) {
    const existing = assetMap.get(tx.assetId);
    if (existing) {
      existing.totalEarned += parseFloat(tx.earnedAmount);
      existing.totalTokensSold += tx.tokenAmount;
      existing.transactionCount += 1;
    } else {
      assetMap.set(tx.assetId, {
        assetId: tx.assetId,
        assetName: tx.assetName,
        assetTokenId: tx.assetTokenId,
        totalEarned: parseFloat(tx.earnedAmount),
        totalTokensSold: tx.tokenAmount,
        transactionCount: 1,
      });
    }
  }

  // Sort by total earned and take top N
  const sorted = Array.from(assetMap.values())
    .sort((a, b) => b.totalEarned - a.totalEarned)
    .slice(0, limit);

  return {
    topAssets: sorted.map((asset, index) => ({
      rank: index + 1,
      assetId: asset.assetId,
      assetName: asset.assetName,
      assetTokenId: asset.assetTokenId,
      totalEarned: asset.totalEarned.toFixed(4),
      totalTokensSold: asset.totalTokensSold,
      transactionCount: asset.transactionCount,
    })),
    currency: 'MATIC',
  };
}

// Mock marketplace listings
export const MOCK_MARKETPLACE_LISTINGS = MOCK_ASSETS.map((asset, index) => ({
  id: asset.id,
  name: asset.name,
  description: asset.description,
  category: asset.category,
  tokenId: asset.tokenId,
  blockchainTokenId: asset.blockchainTokenId,
  creator: {
    username: 'demo_user',
    displayName: 'Demo User',
    walletAddress: MOCK_SELLER_ADDRESS,
  },
  listingId: BigInt(index + 1),
  pricePerToken: BigInt(
    Math.floor(
      [0.5, 1.5, 1.0, 0.75, 2.0][index] * 1e18
    )
  ),
  availableTokens: BigInt([70, 86, 90, 90, 95][index]),
  totalSold: BigInt([30, 14, 10, 10, 5][index]),
  isActive: true,
}));

// Helper to check if mock mode is enabled
export function isMockModeEnabled(): boolean {
  return process.env.USE_MOCK_DATA === 'true';
}
