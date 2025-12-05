// Web3Auth Client ID - Get yours at https://dashboard.web3auth.io
export const WEB3AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || '';

// Chain namespace for EVM chains (Web3Auth v10 uses strings)
const EIP155 = 'eip155';

// Ethereum Mainnet chain config
export const ETHEREUM_MAINNET = {
  chainNamespace: EIP155,
  chainId: '0x1',
  rpcTarget: 'https://rpc.ankr.com/eth',
  displayName: 'Ethereum Mainnet',
  blockExplorerUrl: 'https://etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};

// Ethereum Sepolia Testnet (for development)
export const ETHEREUM_SEPOLIA = {
  chainNamespace: EIP155,
  chainId: '0xaa36a7',
  rpcTarget: 'https://rpc.ankr.com/eth_sepolia',
  displayName: 'Ethereum Sepolia',
  blockExplorerUrl: 'https://sepolia.etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};

// Polygon Mainnet
export const POLYGON_MAINNET = {
  chainNamespace: EIP155,
  chainId: '0x89',
  rpcTarget: 'https://rpc.ankr.com/polygon',
  displayName: 'Polygon Mainnet',
  blockExplorerUrl: 'https://polygonscan.com',
  ticker: 'MATIC',
  tickerName: 'Polygon',
  logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
};

// Default chain config based on environment
export const DEFAULT_CHAIN_CONFIG =
  process.env.NODE_ENV === 'production' ? ETHEREUM_MAINNET : ETHEREUM_SEPOLIA;

// Web3Auth network (v10 uses string values)
export const WEB3AUTH_NETWORK_CONFIG =
  process.env.NODE_ENV === 'production'
    ? 'sapphire_mainnet'
    : 'sapphire_devnet';
