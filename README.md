# Inflectiv - Web3 Data Marketplace

A Web3-powered data marketplace platform that allows users to tokenize, structure, and trade datasets. Features a nostalgic Windows-style desktop UI with soft pastel colors, combined with modern blockchain authentication and AI-powered data processing.

## 🚀 Tech Stack

### Frontend
- **Next.js 16.x** - React framework with App Router
- **React 19.x** - UI library
- **TypeScript 5.x** - Type safety
- **Tailwind CSS 4.x** - Utility-first styling
- **Motion 12.x** - Animations

### Backend
- **tRPC 11.x** - Type-safe API layer
- **Supabase** - PostgreSQL database + auth infrastructure
- **LangChain** - AI orchestration framework
- **Google Gemini AI** - AI integration via LangChain

### Web3 / Authentication
- **Web3Auth Modal** - Social + wallet authentication
- **Ethers.js 6.x** - Ethereum wallet interactions

### Smart Contracts
- **Solidity 0.8.24** - Smart contract language
- **Hardhat 2.19.x** - Development framework
- **OpenZeppelin 5.0.x** - Secure contract libraries
- **Polygon** - Low-cost EVM chain for deployment

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Web3Auth account
- Google Gemini API key
- Polygon wallet (for contract deployment)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/javeriapervaiz-debug/Inflectiv-recreation.git
   cd Inflectiv-recreation
   ```

2. **Install dependencies**
   ```bash
   # Root dependencies
   npm install
   
   # Contract dependencies
   cd contracts
   npm install
   cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Gemini AI
   GEMINI_API_KEY=your_gemini_api_key
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Web3Auth
   NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
   
   # Smart Contract Addresses (set after deployment)
   NEXT_PUBLIC_DATA_NFT_ADDRESS=0x...
   NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
   NEXT_PUBLIC_ACCESS_TOKEN_FACTORY=0x...
   NEXT_PUBLIC_CHAIN_ID=80002  # Polygon Amoy testnet
   ```

4. **Set up Supabase database**
   
   Run the migrations in `supabase/migrations/`:
   - `001_add_blockchain_fields.sql`
   - `002_add_transactions_table.sql`

5. **Deploy smart contracts** (optional for local development)
   ```bash
   cd contracts
   npm run deploy:local  # For local blockchain
   # or
   npm run deploy:amoy   # For Polygon Amoy testnet
   ```

## 🏃 Development

```bash
# Start development server
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

## 📁 Project Structure

```
inflectiv-app/
├── src/                    # Next.js application
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and integrations
│   └── server/           # Server-side code (tRPC, Supabase)
├── contracts/            # Smart contracts (Hardhat)
├── supabase/             # Database migrations
└── public/               # Static assets
```

## 🌐 Deployment

### Railway Deployment

This project is configured for Railway deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Environment Variables for Production

Make sure to set all environment variables in your Railway project settings.

## 📚 Documentation

For detailed documentation, see [summary.md](./summary.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using Next.js, Supabase, and Web3**

