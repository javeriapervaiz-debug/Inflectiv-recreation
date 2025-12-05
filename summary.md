# INFLECTIV - Project Summary

## Overview

Inflectiv is a Web3-powered data marketplace platform that allows users to tokenize, structure, and trade datasets. The platform features a nostalgic Windows-style desktop UI with soft pastel colors, combined with modern blockchain authentication and AI-powered data processing.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Lucide React | 0.555.x | Icon library |
| Motion | 12.x | Animations |
| react-markdown | latest | Markdown rendering in chat |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| tRPC | 11.x | Type-safe API layer |
| Supabase | 2.x | PostgreSQL database + auth infrastructure |
| LangChain | latest | AI orchestration framework |
| @langchain/google-genai | latest | Gemini AI integration via LangChain |

### Web3 / Authentication
| Technology | Version | Purpose |
|------------|---------|---------|
| Web3Auth Modal | 10.x | Social + wallet authentication |
| Ethers.js | 6.x | Ethereum wallet interactions |

### Smart Contracts (Solidity)
| Technology | Version | Purpose |
|------------|---------|---------|
| Solidity | 0.8.24 | Smart contract language |
| Hardhat | 2.19.x | Development framework |
| OpenZeppelin | 5.0.x | Secure contract libraries |
| Polygon | - | Low-cost EVM chain for deployment |

---

## Features Implemented

### 1. Authentication System
- **Multi-method login** via Web3Auth:
  - Google OAuth
  - Email (passwordless)
  - MetaMask / wallet connection
- **Auto-generated wallets** for social login users (non-custodial)
- **User sync** with Supabase database on login
- **Session persistence** across page refreshes

### 2. User Management
- User records stored in Supabase `users` table
- Lookup by wallet address or email
- Profile fields: email, wallet_address, username, display_name, avatar_url, bio
- Row Level Security (RLS) policies configured

### 3. RAG Service (Data Ingestion) - Enhanced

#### Core Capabilities
- **LangChain + Gemini AI Integration** for intelligent data processing
- **Chatbot-style interface** with real-time processing notifications
- **Auto-generated metadata** (name, description, category) from uploaded data
- **Conversation history** for contextual Q&A about datasets

#### Multiple Data Source Options
Users can create datasets through 4 different methods:

1. **Use Your Data (File Upload)**
   - Multi-file upload with drag-and-drop
   - Supported formats: PDF, CSV, TXT, MD
   - Max file size: 10MB per file
   - Files combined into single comprehensive dataset

2. **Use the Web**
   - URL scraping to extract data from web pages
   - Search query processing via AI
   - Multiple sources can be added

3. **Generate with AI**
   - Create datasets from text descriptions
   - Format options: Structured, Narrative, Tabular
   - Length options: Brief (~500 words), Standard (~2000 words), Comprehensive (~5000 words)

4. **Blend All Sources**
   - Combine files, web sources, and AI generation
   - Tabbed interface for managing each source type
   - AI enhancement prompt for enriching combined data

#### API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ingest` | POST | Single file processing |
| `/api/ingest/batch` | POST | Multiple file processing |
| `/api/ingest/web` | POST | URL and search query processing |
| `/api/ingest/generate` | POST | AI dataset generation |
| `/api/ingest/blend` | POST | Combined source processing |
| `/api/chat` | POST | Q&A about user's datasets |

### 4. Desktop Dashboard UI
The dashboard features a nostalgic Windows-style desktop experience:

#### Desktop Environment
- **Desktop Background**: Pastel sunset gradient (peach to coral to pink)
- **Soft Grid Overlay**: Subtle white grid pattern for retro feel
- **Floating Decorations**: Animated pastel gradient orbs and cute icons (stars, hearts, sparkles)
- **Desktop Icons**: App shortcuts arranged on the left side
- **User Widget**: Profile info in top-right corner (hidden when windows maximized)
- **Taskbar**: Windows-style taskbar at bottom with Start button and open windows

#### Desktop Apps (Icons)
| App | Icon | Purpose |
|-----|------|---------|
| Upload Data | Upload | Create new datasets via AI chat |
| Marketplace | Store | Browse and purchase datasets |
| Earnings | Coins | Track sales and royalty earnings |
| My Data | FolderOpen | Manage saved dataset assets |
| Settings | Settings | Account and app preferences |

#### Window Management
- **Draggable Windows**: Click and drag title bar to move
- **Minimize/Maximize/Close**: Standard window controls
- **Focus Management**: Click to bring window to front
- **Z-Index Stacking**: Proper layering of overlapping windows
- **Taskbar Integration**: Click taskbar items to focus/minimize windows
- **Maximized Mode**: Desktop icons and widgets hidden when any window is maximized

### 5. Smart Contracts (Tokenization Layer) ✅

#### Contracts Implemented
| Contract | File | Purpose | Status |
|----------|------|---------|--------|
| **DataNFT** | `contracts/src/DataNFT.sol` | ERC-721 NFT representing dataset ownership | ✅ Complete |
| **AccessToken** | `contracts/src/AccessToken.sol` | ERC-20 token for access rights (1 token = 1 access) | ✅ Complete |
| **AccessTokenFactory** | `contracts/src/AccessTokenFactory.sol` | Factory for deploying AccessToken contracts | ✅ Complete |
| **Marketplace** | `contracts/src/Marketplace.sol` | Listing, purchasing, and revenue distribution | ✅ Complete |

#### Key Features
- **Dual-Token Model**: Inspired by Ocean Protocol
  - DataNFT = Ownership of dataset (transferable)
  - AccessToken = Right to consume data (tradeable)
- **EIP-2981 Royalties**: 5% default royalty on secondary sales
- **Platform Fee**: 2.5% on marketplace transactions
- **Revenue Distribution**: Automatic split (92.5% seller, 5% creator, 2.5% platform)
- **Access Control**: Token-gated access to full datasets

#### Contract Functions

**DataNFT.sol**
```solidity
// Mint a new dataset NFT with access tokens
mintDataset(to, assetId, name, category, metadataURI, initialAccessSupply)
  → returns (tokenId, accessTokenAddress)

// Mint additional access tokens
mintAccessTokens(tokenId, to, amount)

// Check if user has access
hasAccess(tokenId, account) → bool

// Get dataset info
getDataset(tokenId) → DatasetInfo
```

**AccessToken.sol**
```solidity
// Standard ERC-20 functions
transfer(to, amount)
approve(spender, amount)
balanceOf(account) → uint256

// Access-specific
hasAccess(account) → bool  // balance >= 1 token
accessUnits(account) → uint256  // number of access rights
consumeAccess(amount)  // optional burn on use
```

**Marketplace.sol**
```solidity
// List access tokens for sale
createListing(datasetTokenId, pricePerToken, tokenAmount)
  → returns listingId

// Purchase access tokens
purchaseAccess(listingId, tokenAmount) payable

// Update/cancel listing
updateListing(listingId, newPrice, additionalTokens)
cancelListing(listingId)

// View functions
calculatePurchase(listingId, amount) → PurchaseInfo
getActiveListings(offset, limit) → Listing[]
```

#### Test Results
```
✓ Should mint a dataset with access tokens
✓ Should not allow duplicate asset IDs
✓ Should allow owner to mint additional access tokens
✓ Should return correct royalty info
✓ Should check access correctly
✓ Should create a listing
✓ Should allow purchase with correct payment distribution
✓ Should allow cancelling a listing
✓ Should calculate purchase correctly
✓ Should check access correctly
✓ Should return correct access units
✓ Should be transferable
✓ Should be burnable

13 passing
```

---

## Main Idea / Current Flow

```
1. User visits homepage (/)
   └── Sees landing page with "Enter the Data Layer" CTA

2. User clicks to authenticate (/auth)
   └── Web3Auth modal presents options:
       ├── Google login
       ├── Email login
       └── Wallet connection (MetaMask, etc.)

3. After authentication
   └── User synced to Supabase database
   └── Redirected to dashboard (/dashboard)

4. On Dashboard - Create Dataset
   └── User interacts with AI chat to:
       ├── Click "New" button to create dataset
       │   ├── "Use Your Data" - Upload multiple files
       │   ├── "Use the Web" - Enter URLs or search topics
       │   ├── "Generate with AI" - Describe desired dataset
       │   └── "Blend All Sources" - Combine all methods
       ├── AI processes and structures the data
       ├── Dataset saved to Supabase with auto-generated metadata
       ├── View created dataset info card with name, description, token ID
       └── Ask questions about existing datasets via chat

5. Mint Dataset as NFT (New!)
   └── From AssetInfoCard, click "Mint as NFT"
       ├── MintingModal opens
       ├── Configure access token supply (default: 100)
       ├── Sign transaction with wallet
       ├── DataNFT minted + AccessToken contract deployed
       ├── Blockchain IDs stored in Supabase
       └── "List on Marketplace" button appears

6. List on Marketplace (New!)
   └── Click "List on Marketplace" button
       ├── ListingModal opens
       ├── Set price per access token (min: 0.001 MATIC)
       ├── Choose number of tokens to list
       ├── View revenue breakdown (seller 92.5%, royalty 5%, platform 2.5%)
       ├── Sign transaction
       └── Dataset appears on marketplace

7. Browse & Purchase (/marketplace)
   └── Browse listed datasets
       ├── Filter by category
       ├── Search by name/description
       ├── View listing details (price, availability, creator)
       ├── Click "Buy" to purchase
       │   ├── PurchaseModal opens
       │   ├── Select token quantity
       │   ├── See total price
       │   ├── Confirm transaction
       │   └── Receive access tokens
       └── Access granted to full dataset

8. Track Earnings (/dashboard/earnings) (New!)
   └── View earnings dashboard
       ├── See total earnings (sales + royalties)
       ├── Track this month's earnings
       ├── View transaction history
       │   ├── Filter by type (all, sales, royalties)
       │   ├── See buyer addresses
       │   └── Link to block explorer
       ├── See top performing assets
       │   ├── Ranked by total earned
       │   └── View tokens sold per asset
       └── Understand earnings breakdown
           ├── Sales (92.5% of purchases)
           └── Royalties (5% on secondary sales)
```

---

## UI Style & Theme

### Design Philosophy
**Cute Pastel Windows Desktop** - A nostalgic Windows-style desktop aesthetic with soft, cute pastel colors. The UI combines retro computing nostalgia with modern, friendly aesthetics.

### Color Palette

#### Background Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Peach Light | `#ffecd2` | Background gradient start |
| Coral | `#fcb69f` | Background gradient middle |
| Rose Pink | `#ee9ca7` | Background gradient end |
| Lavender Gray | `#f5f0f7` | Window backgrounds, taskbar |
| Light Lavender | `#e8e0ed` | Borders, secondary backgrounds |

#### Accent Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Soft Purple | `#b4a7d6` | Primary accent, title bars |
| Dusty Rose | `#d5a6bd` | Title bar gradient end |
| Mint Green | `#b5ead7` | Success states, active badges |
| Light Mint | `#a8e6cf` | Hover states, accents |
| Soft Cyan | `#a8d8ea` | Info states, category badges |
| Light Cyan | `#a0e7e5` | Floating decorations |
| Soft Pink | `#ffb5c5` | Settings, delete actions |
| Light Pink | `#ff8fab` | Hover states |
| Soft Yellow | `#ffeaa7` | Warnings, minimize button |
| Golden | `#fdcb6e` | Highlights, earnings |
| Soft Coral | `#ffb7b2` | Close button, errors |
| Light Lavender | `#dbb4f3` | Minted badges, royalties |

#### Text Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Dark Gray | `#3d3d3d` | Primary text |
| Medium Gray | `#5a5a5a` | Secondary text |
| Muted Purple | `#8b7b9b` | Tertiary text, placeholders |
| Soft Purple | `#8b7ba8` | Icons, links |
| Light Muted | `#b8a8c5` | Disabled text |

### UI Components

#### Desktop Window (`DesktopWindow.tsx`)
- **Window Frame**: Soft lavender background with subtle shadow effects
- **Title Bar**: Gradient from soft purple to dusty rose
- **Window Controls**: Colored circles (yellow minimize, mint maximize, coral close)
- **Menu Bar**: File/Edit/View/Help with hover states
- **Content Area**: Gradient from white-pink to soft peach
- **Status Bar**: Ready indicator with window title

#### Desktop Icons (`DesktopIcon.tsx`)
- **Icon Container**: Gradient background matching app purpose
- **Label**: White text with drop shadow for visibility
- **Hover State**: Scale up with enhanced shadow
- **Selected State**: Ring indicator

#### Taskbar (`Taskbar.tsx`)
- **Background**: Gradient from lavender to light lavender
- **Start Button**: Mint green with sparkles icon
- **Open Windows**: Lavender buttons with app icons
- **Active Window**: Purple background highlight
- **Clock**: Right-aligned with pulsing green dot

### Typography
- **VT323** monospace font for retro aesthetic in headers
- **System fonts** for body text for readability
- Gradient text effects on main headings
- Drop shadows on title bar text
- Font weights: semibold for headings, medium for labels

### Animations
- **Floating Elements**: Slow float animation for decorative orbs
- **Icons**: Stars, hearts, sparkles, clouds floating in background
- **Hover Transitions**: Smooth scale and shadow transitions
- **Loading States**: Spinning loader with purple color
- **Window Transitions**: Fade and scale on minimize/restore
- **Pulse Effects**: Clock indicator, online status

---

## Component Architecture

### Desktop UI Components

#### molecules/
| Component | Purpose |
|-----------|---------|
| `DesktopIcon.tsx` | Clickable app icon with gradient background and label |
| `DesktopWindow.tsx` | Draggable window container with title bar and controls |
| `Taskbar.tsx` | Windows-style taskbar with Start button, open windows, and clock |
| `MyDataAssets.tsx` | Asset list with actions dropdown (Edit, Mint, View, Delete) |

### Chat System Components

#### molecules/
| Component | Purpose |
|-----------|---------|
| `ChatMessage.tsx` | Individual message display with styling |
| `TypingIndicator.tsx` | Animated loading state |
| `AssetInfoCard.tsx` | Displays created dataset info (name, description, token ID) |
| `DataSourceSelector.tsx` | 4-option grid for choosing data source type |
| `FileUploadPanel.tsx` | Multi-file drag-drop upload interface |
| `WebSourcePanel.tsx` | URL and search query input interface |
| `AIGeneratePanel.tsx` | AI dataset generation with format/length options |
| `BlendSourcesPanel.tsx` | Tabbed interface for combining all source types |

#### organisms/
| Component | Purpose |
|-----------|---------|
| `IngestionChat.tsx` | Main chat container with view mode management, supports editing existing assets |

### Minting & Marketplace Components

#### molecules/
| Component | Purpose |
|-----------|---------|
| `MintingModal.tsx` | Modal for minting datasets as NFTs with access tokens |
| `ListingCard.tsx` | Marketplace listing card with price, availability, buy button |
| `PurchaseModal.tsx` | Modal for purchasing access tokens from listings |
| `ListingModal.tsx` | Modal for creating marketplace listings with price config |

---

### 6. Minting Integration ✅

#### Overview
After a dataset is created and saved to Supabase, users can mint it as an NFT directly from the AssetInfoCard.

#### Flow
```
Dataset Created → AssetInfoCard displayed
                        ↓
              Click "Mint as NFT" button
                        ↓
               MintingModal opens
                        ↓
        Configure access token supply (default: 100)
                        ↓
              Confirm → Sign transaction
                        ↓
         Contract: DataNFT.mintDataset()
                        ↓
    NFT minted + AccessToken contract deployed
                        ↓
      Supabase updated with blockchain IDs
                        ↓
       "List on Marketplace" button appears
```

#### Key Components

**AssetInfoCard.tsx** (Updated)
- Added "Mint as NFT" button with Coins icon
- Shows "Minted" badge after successful minting
- Displays blockchain token ID (NFT #X)
- Shows "List on Marketplace" button after minting
- Integrates with wallet provider for transactions

**MintingModal.tsx** (New)
- 4-step flow: confirm → minting → success → error
- Configurable access token supply (1-10,000)
- Shows transaction progress and confirmation
- Links to block explorer after success
- Error handling with retry option

#### Minting Service (`src/lib/contracts/minting.ts`)

```typescript
// Mint a new DataNFT
import { mintDataset, generateMetadataURI } from '@/lib/contracts';

const result = await mintDataset(provider, {
  to: walletAddress,
  assetId: 'supabase-asset-id',
  name: 'Dataset Name',
  category: 'technical',
  metadataURI: generateMetadataURI(...),
  initialAccessSupply: 100,
});

// Result: { success, transactionHash, tokenId, accessTokenAddress }
```

#### API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/assets/update-mint` | POST | Store blockchain token ID in Supabase after minting |
| `/api/assets/check-access` | GET/POST | Check if user has access to a dataset |

---

### 7. Marketplace UI ✅

#### Overview
Full-featured marketplace for browsing, listing, and purchasing dataset access tokens.

#### Marketplace Page (`/marketplace`)
- Browse all listed datasets with category filtering
- Search functionality across name, description, category
- Real-time listing data from blockchain
- Purchase flow with modal confirmation
- Responsive grid layout (1-3 columns)

#### Features
- **Category Filter**: All, financial, legal, technical, medical, research, business, general
- **Search**: Full-text search across dataset metadata
- **Refresh**: Manual refresh button for listings
- **Live Status**: Green indicator showing marketplace is live

#### Components

**ListingCard.tsx**
```typescript
interface ListingData {
  id: string;                    // Supabase ID
  name: string;
  description: string;
  category: string;
  tokenId: string;               // INFL-xxx
  blockchainTokenId?: string;    // NFT token ID
  creator?: {
    username?: string;
    displayName?: string;
    walletAddress?: string;
  };
  listingId?: bigint;            // Marketplace listing ID
  pricePerToken?: bigint;        // Price in wei
  availableTokens?: bigint;
  totalSold?: bigint;
}
```

**PurchaseModal.tsx**
- Token amount selector with +/- buttons
- Price breakdown (per token, quantity, total)
- Transaction confirmation flow
- Success state with explorer link

**ListingModal.tsx**
- Price per token input (min: 0.001 MATIC)
- Token quantity slider
- Revenue breakdown showing:
  - Total sales revenue
  - Platform fee (2.5%)
  - Creator royalty (5%)
  - Seller earnings (92.5%)

#### Marketplace Functions

```typescript
import {
  createListing,
  purchaseAccess,
  cancelListing,
  updateListing,
  getActiveListings,
} from '@/lib/contracts';

// Create a listing
const listing = await createListing(provider, {
  datasetTokenId: 1,
  pricePerToken: '0.01',  // MATIC
  tokenAmount: 50,
});

// Purchase access
const purchase = await purchaseAccess(provider, {
  listingId: 1,
  tokenAmount: 5,
  totalPrice: parseEther('0.05'),
});
```

---

### 8. Access Gating ✅

#### Overview
API endpoint to verify if a user has access to a dataset before serving full content.

#### Check Access API (`/api/assets/check-access`)

**Request:**
```typescript
GET /api/assets/check-access?assetId=xxx&walletAddress=0x...
// or
POST /api/assets/check-access
{ "assetId": "xxx", "walletAddress": "0x..." }
```

**Response:**
```typescript
{
  success: true,
  hasAccess: boolean,
  isOwner: boolean,
  accessLevel: 'owner' | 'token_holder' | 'none',
  tokenBalance?: string,
  message?: string
}
```

#### Access Levels
1. **Owner**: Dataset creator - always has full access
2. **Token Holder**: Holds ≥1 AccessToken - has full access
3. **None**: No tokens - preview only

#### Usage in Frontend
```typescript
const checkAccess = async (assetId: string, walletAddress: string) => {
  const res = await fetch(`/api/assets/check-access?assetId=${assetId}&walletAddress=${walletAddress}`);
  const data = await res.json();

  if (data.hasAccess) {
    // Show full dataset
  } else {
    // Show preview only
  }
};
```

---

### 9. Earnings Dashboard ✅

#### Overview
Track all earnings from dataset sales and royalties. When users purchase access tokens, the transaction is recorded and earnings are displayed in real-time.

#### Revenue Split
- **92.5%** → Seller (dataset owner)
- **5%** → Creator royalty (on secondary sales)
- **2.5%** → Platform fee

#### Earnings Page (`/dashboard/earnings`)

**Features:**
- **Stats Cards**: Total earned, this month's earnings, sales count, tokens sold
- **Transaction History**: Filterable list of all sales and royalties
- **Top Performing Assets**: Ranked list of best-selling datasets
- **Earnings Breakdown**: Sales vs royalties visualization

#### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| Earnings Page | `src/app/dashboard/earnings/page.tsx` | Main earnings dashboard with Win95 styling |
| Summary API | `src/app/api/earnings/summary/route.ts` | Aggregated earnings data |
| Transactions API | `src/app/api/earnings/transactions/route.ts` | Paginated transaction history |
| Top Assets API | `src/app/api/earnings/top-assets/route.ts` | Best performing datasets |
| Record API | `src/app/api/earnings/record/route.ts` | Store new transactions |

#### API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/earnings/summary` | GET | Get aggregated earnings summary |
| `/api/earnings/transactions` | GET | Get transaction history with filtering |
| `/api/earnings/top-assets` | GET | Get top performing assets by earnings |
| `/api/earnings/record` | POST | Record a new transaction after purchase |

#### Summary API (`/api/earnings/summary`)

**Request:**
```typescript
GET /api/earnings/summary?walletAddress=0x...
```

**Response:**
```typescript
{
  success: true,
  data: {
    totalEarnings: "2.4500",
    totalSalesEarnings: "2.2000",
    totalRoyaltyEarnings: "0.2500",
    thisMonthEarnings: "0.8500",
    totalTransactions: 15,
    totalSalesCount: 12,
    totalRoyaltiesCount: 3,
    totalTokensSold: 45,
    currency: "MATIC"
  }
}
```

#### Transactions API (`/api/earnings/transactions`)

**Request:**
```typescript
GET /api/earnings/transactions?walletAddress=0x...&type=all&limit=20&offset=0
// type: 'all' | 'sale' | 'royalty'
```

**Response:**
```typescript
{
  success: true,
  data: {
    transactions: [
      {
        id: "uuid",
        transactionHash: "0x...",
        assetName: "Financial Q3 Data",
        assetTokenId: "INFL-123456",
        earningType: "sale",
        earnedAmount: "0.2500",
        totalAmount: "0.2700",
        tokenAmount: 5,
        buyerAddress: "0x...",
        createdAt: "2024-12-05T10:30:00Z",
        chainId: 80002
      }
    ],
    pagination: {
      total: 15,
      limit: 20,
      offset: 0,
      hasMore: false
    }
  }
}
```

#### Top Assets API (`/api/earnings/top-assets`)

**Request:**
```typescript
GET /api/earnings/top-assets?walletAddress=0x...&limit=5
```

**Response:**
```typescript
{
  success: true,
  data: {
    topAssets: [
      {
        rank: 1,
        assetId: "uuid",
        assetName: "Financial Q3 Data",
        assetTokenId: "INFL-123456",
        totalEarned: "1.2500",
        totalTokensSold: 45,
        transactionCount: 8
      }
    ],
    currency: "MATIC"
  }
}
```

#### Transaction Recording

Transactions are automatically recorded when a purchase completes in PurchaseModal:

```typescript
// In PurchaseModal.tsx
import { purchaseAccess, recordTransaction } from '@/lib/contracts';

const result = await purchaseAccess(provider, params);
if (result.success && result.eventData) {
  // Fire and forget - don't block the UI
  recordTransaction(result, listing.creator?.walletAddress).catch(console.error);
}
```

The `purchaseAccess` function now returns event data from the `AccessPurchased` blockchain event:

```typescript
// Updated PurchaseResult interface
interface PurchaseResult {
  success: boolean;
  transactionHash?: string;
  tokensReceived?: number;
  blockNumber?: number;
  eventData?: {
    listingId: bigint;
    datasetTokenId: bigint;
    buyer: string;
    seller: string;
    tokenAmount: bigint;
    totalPrice: bigint;
    platformFee: bigint;
    royaltyAmount: bigint;
    pricePerToken: bigint;
  };
  error?: string;
}
```

#### Database Migration: `002_add_transactions_table.sql`

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_hash TEXT UNIQUE NOT NULL,
  block_number BIGINT,
  asset_id UUID REFERENCES assets(id),
  listing_id TEXT,
  seller_address TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  creator_address TEXT,
  total_amount TEXT NOT NULL,
  seller_amount TEXT NOT NULL,
  platform_fee TEXT NOT NULL,
  royalty_amount TEXT NOT NULL,
  total_amount_display DECIMAL(18, 8),
  seller_amount_display DECIMAL(18, 8),
  platform_fee_display DECIMAL(18, 8),
  royalty_amount_display DECIMAL(18, 8),
  token_amount INTEGER NOT NULL,
  price_per_token TEXT,
  asset_name TEXT,
  asset_token_id TEXT,
  blockchain_token_id TEXT,
  transaction_type TEXT DEFAULT 'sale',
  chain_id INTEGER,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_transactions_seller ON transactions(seller_address);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_address);
CREATE INDEX idx_transactions_creator ON transactions(creator_address);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- Aggregated earnings view
CREATE VIEW earnings_summary AS
SELECT
  seller_address as wallet_address,
  'sale' as earning_type,
  COUNT(*) as transaction_count,
  SUM(seller_amount_display) as total_earned,
  SUM(token_amount) as total_tokens_sold
FROM transactions
WHERE status = 'confirmed'
GROUP BY seller_address
UNION ALL
SELECT
  creator_address as wallet_address,
  'royalty' as earning_type,
  COUNT(*) as transaction_count,
  SUM(royalty_amount_display) as total_earned,
  NULL as total_tokens_sold
FROM transactions
WHERE status = 'confirmed' AND creator_address IS NOT NULL
GROUP BY creator_address;
```

---

### 10. My Data Assets ✅

#### Overview
The My Data window provides a centralized view of all user's saved dataset assets. Users can manage their datasets, edit them via the AI chat, or mint them as NFTs.

#### Features
- **Asset List**: View all saved datasets with name, description, status, category, and creation date
- **Status Badges**: Visual indicators (Active, Processing, Draft, Archived)
- **Category Tags**: Color-coded category labels (financial, legal, technical, etc.)
- **Minted Badge**: Shows if dataset has been minted as NFT
- **Actions Dropdown**: Per-asset actions menu

#### Actions Menu
| Action | Icon | Description |
|--------|------|-------------|
| Edit Dataset | Edit3 | Opens Upload Data window with asset context for editing |
| Mint as NFT | Coins | Opens MintingModal (only if not already minted) |
| View Details | Eye | View full dataset details (placeholder) |
| Delete | Trash2 | Delete the dataset (placeholder) |

#### Component: `MyDataAssets.tsx`

```typescript
interface MyDataAssetsProps {
  userId: string | undefined;
  onEditAsset: (asset: Asset) => void;
  onMintAsset: (asset: Asset) => void;
}

interface Asset {
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
```

#### Edit Functionality
When user clicks "Edit Dataset":
1. `handleEditAsset(asset)` is called in dashboard
2. `editingAsset` state is set with asset data
3. Upload Data window opens automatically
4. `IngestionChat` receives `editingAsset` prop
5. Chat shows contextual welcome message with asset info
6. User can chat with AI to modify the dataset

**IngestionChat Edit Mode:**
```typescript
interface EditingAsset {
  id: string;
  name: string;
  description: string;
  tokenId: string;
}

interface IngestionChatProps {
  userId?: string;
  editingAsset?: EditingAsset;
}
```

When `editingAsset` is provided:
- Initial message shows: "I'm ready to help you edit [asset name]"
- Current description is displayed
- Options: Upload new files, ask questions, modify structure
- Editing context sent to chat API for context-aware responses

#### Editing Banner
When editing an asset, the Upload Data window shows a banner:
- Purple background with Edit3 icon
- Shows "Editing: [Asset Name]"
- "Clear" button to exit edit mode
- Asset description preview

#### Integration Flow
```
My Data Window
       ↓
  Asset List (MyDataAssets)
       ↓
  Actions Menu → Click "Edit"
       ↓
  handleEditAsset(asset)
       ↓
  setEditingAsset(asset) + openWindow('upload')
       ↓
  Upload Data Window with Editing Banner
       ↓
  IngestionChat receives editingAsset prop
       ↓
  Contextual chat for editing
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  wallet_address TEXT UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Assets Table
```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token_id TEXT UNIQUE,                    -- Supabase token ID (INFL-xxx)
  name TEXT,
  description TEXT,
  category TEXT,
  tags TEXT[],
  structured_data JSONB,
  original_filename TEXT,
  file_type TEXT,
  file_size INTEGER,
  price DECIMAL(18, 8),
  currency TEXT DEFAULT 'ETH',
  is_listed BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  status TEXT,                              -- draft, processing, active, archived
  ipfs_hash TEXT,
  storage_url TEXT,

  -- Blockchain fields (added via migration)
  blockchain_token_id TEXT,                 -- NFT token ID from DataNFT contract
  access_token_address TEXT,                -- ERC-20 AccessToken contract address
  mint_transaction_hash TEXT,               -- Minting transaction hash
  is_minted BOOLEAN DEFAULT FALSE,          -- Whether minted on-chain
  listing_id TEXT,                          -- Marketplace listing ID
  listing_price DECIMAL(18, 8),             -- Price per access token
  available_access_tokens INTEGER DEFAULT 0, -- Tokens available for sale

  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Database Migration
Run this after the main schema to add blockchain fields:
```sql
-- File: supabase/migrations/001_add_blockchain_fields.sql
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS blockchain_token_id TEXT,
ADD COLUMN IF NOT EXISTS access_token_address TEXT,
ADD COLUMN IF NOT EXISTS mint_transaction_hash TEXT,
ADD COLUMN IF NOT EXISTS is_minted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS listing_id TEXT,
ADD COLUMN IF NOT EXISTS listing_price DECIMAL(18, 8),
ADD COLUMN IF NOT EXISTS available_access_tokens INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_assets_blockchain_token ON assets(blockchain_token_id);
CREATE INDEX IF NOT EXISTS idx_assets_minted ON assets(is_minted) WHERE is_minted = TRUE;
```

---

## Project Structure

```
inflectiv-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── auth/page.tsx      # Authentication page
│   │   ├── dashboard/page.tsx # Main dashboard
│   │   ├── marketplace/page.tsx # Marketplace browse/purchase
│   │   ├── api/               # API routes
│   │   │   ├── chat/          # Q&A endpoint
│   │   │   ├── ingest/        # File upload endpoints
│   │   │   │   ├── route.ts       # Single file
│   │   │   │   ├── batch/         # Multiple files
│   │   │   │   ├── web/           # URL/search processing
│   │   │   │   ├── generate/      # AI generation
│   │   │   │   └── blend/         # Combined sources
│   │   │   ├── assets/        # Asset management
│   │   │   │   ├── update-mint/   # Store blockchain IDs
│   │   │   │   └── check-access/  # Verify access rights
│   │   │   └── trpc/          # tRPC handler
│   │   └── layout.tsx         # Root layout with providers
│   │
│   ├── components/
│   │   ├── atoms/             # Basic UI elements (Button, Card, Badge)
│   │   ├── molecules/         # Composed components
│   │   │   ├── DesktopIcon.tsx      # Desktop app shortcut icon
│   │   │   ├── DesktopWindow.tsx    # Draggable window container
│   │   │   ├── Taskbar.tsx          # Windows-style taskbar
│   │   │   ├── MyDataAssets.tsx     # Asset list with actions menu
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   ├── AssetInfoCard.tsx    # Dataset display + mint button
│   │   │   ├── MintingModal.tsx     # NFT minting flow
│   │   │   ├── ListingCard.tsx      # Marketplace listing display
│   │   │   ├── PurchaseModal.tsx    # Buy access tokens
│   │   │   ├── ListingModal.tsx     # Create marketplace listing
│   │   │   ├── ConnectWallet.tsx    # Wallet connection button
│   │   │   ├── DataSourceSelector.tsx
│   │   │   ├── FileUploadPanel.tsx
│   │   │   ├── WebSourcePanel.tsx
│   │   │   ├── AIGeneratePanel.tsx
│   │   │   └── BlendSourcesPanel.tsx
│   │   └── organisms/         # Complex components
│   │       └── IngestionChat.tsx    # Chat with editingAsset support
│   │
│   ├── lib/
│   │   ├── web3auth/          # Web3Auth provider & hooks
│   │   │   ├── provider.tsx   # Context provider with getProvider()
│   │   │   ├── config.ts      # Chain configurations
│   │   │   ├── useAuthSync.ts # Sync user to Supabase
│   │   │   └── index.ts
│   │   ├── trpc/              # tRPC client setup
│   │   ├── contracts/         # Smart contract integration
│   │   │   ├── abis.ts        # Contract ABIs
│   │   │   ├── config.ts      # Chain & address config
│   │   │   ├── minting.ts     # Minting & listing functions
│   │   │   └── index.ts       # Helper functions & exports
│   │   └── utils/             # Utility functions
│   │
│   ├── styles/
│   │   └── theme.css          # Pastel color theme CSS variables
│   │
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   │
│   └── server/
│       ├── supabase/          # Supabase client & types
│       └── trpc/              # tRPC routers
│           └── routers/
│               └── asset.ts   # Asset CRUD operations
│
├── contracts/                  # Smart Contracts (Hardhat)
│   ├── src/
│   │   ├── DataNFT.sol        # ERC-721 dataset ownership
│   │   ├── AccessToken.sol    # ERC-20 access rights
│   │   ├── AccessTokenFactory.sol  # Factory pattern
│   │   ├── Marketplace.sol    # Buy/sell/list
│   │   └── IAccessTokenFactory.sol # Interface
│   ├── scripts/
│   │   └── deploy.ts          # Deployment script
│   ├── test/
│   │   └── DataNFT.test.ts    # Contract tests
│   ├── hardhat.config.ts      # Hardhat configuration
│   └── package.json           # Contract dependencies
│
├── supabase/
│   ├── schema.sql             # Database schema
│   └── migrations/
│       └── 001_add_blockchain_fields.sql  # Blockchain fields
│
├── .env.local                 # Environment variables
├── SUMMARY.md                 # This file
└── package.json
```

---

## Environment Variables

```env
# Gemini AI
GEMINI_API_KEY=your_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Web3Auth
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_client_id

# Smart Contract Addresses (set after deployment)
NEXT_PUBLIC_DATA_NFT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_ACCESS_TOKEN_FACTORY=0x...
NEXT_PUBLIC_CHAIN_ID=80002  # Polygon Amoy testnet (or 137 for mainnet, 31337 for local)
```

### Contract Deployment (.env in /contracts)
```env
DEPLOYER_PRIVATE_KEY=your_wallet_private_key
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

---

## Type Definitions

```typescript
// Chat message types
interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  file?: { name: string; size: number };
  status?: 'sending' | 'sent' | 'error';
  assetInfo?: {
    assetId: string;
    tokenId: string;
    generatedName: string;
    generatedDescription: string;
    category: string;
  };
}

// API response types
interface ChatResponse {
  success: boolean;
  response: string;
  hasWebSearch: boolean;
  datasetsUsed: number;
  error?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Data source type
type DataSourceType = 'files' | 'web' | 'ai' | 'blend';
```

---

## Smart Contracts (Tokenization Layer)

### Overview
The tokenization layer uses a dual-token model inspired by Ocean Protocol:
- **DataNFT (ERC-721)**: Represents ownership of a dataset
- **AccessToken (ERC-20)**: Represents access rights to consume the data

### Contract Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                     INFLECTIV TOKENIZATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────────────────┐  │
│  │   DATA NFT       │         │      SUPABASE                │  │
│  │   (ERC-721)      │◄───────►│  - Asset metadata            │  │
│  │                  │         │  - Encrypted data storage    │  │
│  │  • Ownership     │         │  - Access control (RLS)      │  │
│  │  • Royalties     │         └──────────────────────────────┘  │
│  │  • Transferable  │                                           │
│  └────────┬─────────┘                                           │
│           │ deploys                                             │
│           ▼                                                     │
│  ┌──────────────────┐         ┌──────────────────────────────┐  │
│  │  ACCESS TOKEN    │         │      IPFS (Future)           │  │
│  │   (ERC-20)       │◄───────►│  - Public metadata           │  │
│  │                  │         │  - Preview data samples      │  │
│  │  • Consumption   │         └──────────────────────────────┘  │
│  │  • Tradeable     │                                           │
│  │  • DEX-compat    │                                           │
│  └──────────────────┘                                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    MARKETPLACE                            │   │
│  │  • Create listings    • Purchase access tokens            │   │
│  │  • Update/cancel      • Automatic revenue distribution    │   │
│  │  • 2.5% platform fee  • 5% creator royalty               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tokenization Flow
```
1. MINT A DATASET
   User uploads data → Backend processes → Calls DataNFT.mintDataset()
   → Creates NFT (ownership) + AccessToken (100 access tokens)

2. LIST FOR SALE
   Owner calls Marketplace.createListing(tokenId, price, amount)
   → Dataset appears in marketplace

3. PURCHASE ACCESS
   Buyer calls Marketplace.purchaseAccess(listingId, amount)
   → Pays MATIC → Receives AccessTokens
   → Revenue split: 92.5% seller, 5% creator royalty, 2.5% platform

4. ACCESS DATA
   Backend checks: AccessToken.balanceOf(user) >= 1
   → If true: serve full dataset
   → If false: serve preview only
```

### Deployment Commands
```bash
# Navigate to contracts
cd contracts

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests (13 passing)
npm run test

# Start local blockchain (for development)
npm run node

# Deploy to local (in another terminal)
npm run deploy:local

# Deploy to Polygon Amoy testnet
npm run deploy:polygonAmoy

# Deploy to Polygon mainnet
npm run deploy:polygon
```

### Local Development Addresses
When running `npm run deploy:local`:
```
AccessTokenFactory: 0x5FbDB2315678afecb367f032d93F642f64180aa3
DataNFT:            0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Marketplace:        0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
Chain ID:           31337
```

### Frontend Integration
Contract utilities available at `src/lib/contracts/`:

```typescript
import {
  getReadContracts,
  getWriteContracts,
  checkDatasetAccess,
  getActiveListings,
  calculatePurchase,
  formatPrice,
  parsePrice,
} from '@/lib/contracts';

// Check if user has access to a dataset
const hasAccess = await checkDatasetAccess(tokenId, userAddress);

// Get active marketplace listings
const listings = await getActiveListings(0, 20);

// Calculate purchase details (price breakdown)
const purchaseInfo = await calculatePurchase(listingId, tokenAmount);
```

---

## Future Roadmap

### Completed ✅
- [x] Web3Auth authentication (Google, Email, MetaMask)
- [x] User management with Supabase
- [x] RAG service for data ingestion (files, web, AI, blend)
- [x] Dashboard with chat interface
- [x] Smart contract infrastructure (DataNFT, AccessToken, Marketplace)
- [x] Contract tests (13 passing)
- [x] Local deployment setup
- [x] Frontend contract integration utilities
- [x] **Minting integration** - Connect ingestion flow to NFT minting
- [x] **Marketplace UI** - Browse, list, purchase datasets
- [x] **Access gating** - Check token balance before serving data
- [x] **Earnings Dashboard** - Track sales, royalties, and top-performing assets
- [x] **Desktop UI Redesign** - Windows-style desktop with pastel theme
- [x] **My Data Assets** - Manage saved datasets with edit/mint actions
- [x] **Asset Editing Flow** - Edit datasets via IngestionChat with context

### Next Up 🚧
- [ ] **IPFS integration** - Store metadata on decentralized storage
- [ ] Deploy to Polygon Amoy testnet
- [ ] Deploy to Polygon mainnet

### Future 📋
- [ ] External wallet connection for funded purchases
- [ ] User profile editing
- [ ] Dataset preview and download with access control
- [ ] Search and filtering improvements
- [ ] Real-time web search integration (Tavily API)
- [ ] Dataset versioning and updates
- [ ] Collaborative dataset editing
- [ ] View Details modal for My Data Assets
- [ ] Delete confirmation for My Data Assets

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

---

*Last updated: December 2024 (Desktop UI Redesign & My Data Assets)*

---

## Quick Reference

### Start Development
```bash
# Frontend
npm run dev

# Smart Contracts (in separate terminals)
cd contracts && npm run node      # Start local blockchain
cd contracts && npm run deploy:local  # Deploy contracts
```

### Key Files
| Purpose | Location |
|---------|----------|
| Landing Page | `src/app/page.tsx` |
| Dashboard (Desktop UI) | `src/app/dashboard/page.tsx` |
| Auth Page | `src/app/auth/page.tsx` |
| Marketplace | `src/app/marketplace/page.tsx` |
| Desktop Icon | `src/components/molecules/DesktopIcon.tsx` |
| Desktop Window | `src/components/molecules/DesktopWindow.tsx` |
| Taskbar | `src/components/molecules/Taskbar.tsx` |
| My Data Assets | `src/components/molecules/MyDataAssets.tsx` |
| Ingestion Chat | `src/components/organisms/IngestionChat.tsx` |
| Asset Info Card | `src/components/molecules/AssetInfoCard.tsx` |
| Minting Modal | `src/components/molecules/MintingModal.tsx` |
| Listing Card | `src/components/molecules/ListingCard.tsx` |
| Purchase Modal | `src/components/molecules/PurchaseModal.tsx` |
| Listing Modal | `src/components/molecules/ListingModal.tsx` |
| Connect Wallet | `src/components/molecules/ConnectWallet.tsx` |
| Pastel Theme | `src/styles/theme.css` |
| Contract ABIs | `src/lib/contracts/abis.ts` |
| Contract Helpers | `src/lib/contracts/index.ts` |
| Minting Service | `src/lib/contracts/minting.ts` |
| Access Check API | `src/app/api/assets/check-access/route.ts` |
| Update Mint API | `src/app/api/assets/update-mint/route.ts` |
| Earnings Summary API | `src/app/api/earnings/summary/route.ts` |
| Earnings Transactions API | `src/app/api/earnings/transactions/route.ts` |
| DataNFT Contract | `contracts/src/DataNFT.sol` |
| Marketplace Contract | `contracts/src/Marketplace.sol` |
| Deploy Script | `contracts/scripts/deploy.ts` |
| DB Migration | `supabase/migrations/001_add_blockchain_fields.sql` |
| Transactions Migration | `supabase/migrations/002_add_transactions_table.sql` |
