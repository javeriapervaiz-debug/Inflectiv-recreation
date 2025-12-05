'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

// User info from Web3Auth
export interface Web3AuthUser {
  email?: string;
  name?: string;
  profileImage?: string;
  walletAddress: string;
  balance?: string;
}

// Auth context state
interface Web3AuthContextType {
  // State
  user: Web3AuthUser | null;
  isLoading: boolean;
  isConnected: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getBalance: () => Promise<string>;
  getProvider: () => Promise<import('ethers').BrowserProvider | null>;
}

const Web3AuthContext = createContext<Web3AuthContextType | null>(null);

// Singleton instance to prevent multiple initializations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let web3authInstance: any = null;
let initPromise: Promise<void> | null = null;

export function Web3AuthProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [web3auth, setWeb3auth] = useState<any>(null);
  const [user, setUser] = useState<Web3AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initStarted = useRef(false);

  // Fetch user info after connection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchUserInfo = useCallback(async (instance: any) => {
    try {
      if (!instance.provider) return;

      const { BrowserProvider } = await import('ethers');

      const userInfo = await instance.getUserInfo();
      const ethersProvider = new BrowserProvider(instance.provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const balance = await ethersProvider.getBalance(address);

      setUser({
        email: userInfo.email,
        name: userInfo.name,
        profileImage: userInfo.profileImage,
        walletAddress: address,
        balance: balance.toString(),
      });
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  }, []);

  // Initialize Web3Auth lazily on client side only
  useEffect(() => {
    // Prevent double initialization from React Strict Mode
    if (initStarted.current) return;
    initStarted.current = true;

    const init = async () => {
      // Only run on client
      if (typeof window === 'undefined') return;

      const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
      if (!clientId || clientId === 'your_web3auth_client_id') {
        console.warn('Web3Auth Client ID not configured - wallet connection disabled');
        setIsInitialized(true);
        return;
      }

      // If already initialized, reuse the instance
      if (web3authInstance) {
        setWeb3auth(web3authInstance);
        if (web3authInstance.connected && web3authInstance.provider) {
          await fetchUserInfo(web3authInstance);
        }
        setIsInitialized(true);
        return;
      }

      // If initialization is in progress, wait for it
      if (initPromise) {
        await initPromise;
        if (web3authInstance) {
          setWeb3auth(web3authInstance);
          if (web3authInstance.connected && web3authInstance.provider) {
            await fetchUserInfo(web3authInstance);
          }
        }
        setIsInitialized(true);
        return;
      }

      // Start new initialization
      initPromise = (async () => {
        try {
          // Dynamic imports to avoid SSR issues with pino/thread-stream
          const { Web3Auth } = await import('@web3auth/modal');

          // Determine chain config based on environment
          const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '80002';

          // Chain configurations
          const chainConfigs: Record<string, any> = {
            // Polygon Amoy Testnet
            '80002': {
              chainNamespace: 'eip155',
              chainId: '0x13882', // 80002 in hex
              rpcTarget: 'https://rpc-amoy.polygon.technology',
              displayName: 'Polygon Amoy',
              blockExplorerUrl: 'https://amoy.polygonscan.com',
              ticker: 'MATIC',
              tickerName: 'MATIC',
              logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
            },
            // Localhost Hardhat
            '31337': {
              chainNamespace: 'eip155',
              chainId: '0x7a69', // 31337 in hex
              rpcTarget: 'http://127.0.0.1:8545',
              displayName: 'Localhost',
              blockExplorerUrl: '',
              ticker: 'ETH',
              tickerName: 'Ethereum',
              logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
            },
            // Sepolia (fallback)
            '11155111': {
              chainNamespace: 'eip155',
              chainId: '0xaa36a7',
              rpcTarget: 'https://rpc.ankr.com/eth_sepolia',
              displayName: 'Ethereum Sepolia',
              blockExplorerUrl: 'https://sepolia.etherscan.io',
              ticker: 'ETH',
              tickerName: 'Ethereum',
              logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
            },
          };

          const selectedChainConfig = chainConfigs[chainId] || chainConfigs['80002'];

          // Web3Auth v10 simplified configuration
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const instance = new Web3Auth({
            clientId,
            web3AuthNetwork: 'sapphire_devnet', // Use string instead of enum for v10
            chainConfig: selectedChainConfig,
            uiConfig: {
              appName: 'Inflectiv',
              mode: 'dark',
              defaultLanguage: 'en',
            },
          } as any);

          await instance.init();
          web3authInstance = instance;
          setWeb3auth(instance);

          // Check if already connected
          if (instance.connected && instance.provider) {
            await fetchUserInfo(instance);
          }
        } catch (err) {
          console.error('Web3Auth initialization error:', err);
          setError(err instanceof Error ? err.message : 'Failed to initialize Web3Auth');
        } finally {
          setIsInitialized(true);
        }
      })();

      await initPromise;
    };

    init();
  }, [fetchUserInfo]);

  // Connect with social login or email
  const connect = useCallback(async () => {
    if (!web3auth) {
      setError('Web3Auth not initialized. Please add your Client ID to .env.local');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await web3auth.connect();

      if (web3auth.provider) {
        await fetchUserInfo(web3auth);
      }
    } catch (err) {
      console.error('Connection error:', err);
      // Don't show error if user closed the modal
      if (err instanceof Error && !err.message.includes('User closed')) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [web3auth, fetchUserInfo]);

  // Disconnect
  const disconnect = useCallback(async () => {
    if (!web3auth) return;

    try {
      await web3auth.logout();
      setUser(null);
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  }, [web3auth]);

  // Get wallet balance
  const getBalance = useCallback(async (): Promise<string> => {
    if (!web3auth?.provider) return '0';

    try {
      const { BrowserProvider } = await import('ethers');
      const ethersProvider = new BrowserProvider(web3auth.provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const balance = await ethersProvider.getBalance(address);
      return balance.toString();
    } catch (err) {
      console.error('Get balance error:', err);
      return '0';
    }
  }, [web3auth]);

  // Get ethers BrowserProvider for contract interactions
  const getProvider = useCallback(async (): Promise<import('ethers').BrowserProvider | null> => {
    if (!web3auth?.provider) return null;

    try {
      const { BrowserProvider } = await import('ethers');
      return new BrowserProvider(web3auth.provider);
    } catch (err) {
      console.error('Get provider error:', err);
      return null;
    }
  }, [web3auth]);

  const value: Web3AuthContextType = {
    user,
    isLoading,
    isConnected: !!user,
    isInitialized,
    error,
    connect,
    disconnect,
    getBalance,
    getProvider,
  };

  return (
    <Web3AuthContext.Provider value={value}>{children}</Web3AuthContext.Provider>
  );
}

// Hook to use Web3Auth context
export function useWeb3Auth() {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider');
  }
  return context;
}
