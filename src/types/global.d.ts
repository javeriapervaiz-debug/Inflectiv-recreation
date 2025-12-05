import { Eip1193Provider } from "ethers";

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      providers?: (Eip1193Provider & { isMetaMask?: boolean })[];
    };
  }
}

export {};
