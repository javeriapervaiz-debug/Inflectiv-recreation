'use client';

import { TRPCProvider } from '@/lib/trpc';
import { Web3AuthProvider } from '@/lib/web3auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <Web3AuthProvider>{children}</Web3AuthProvider>
    </TRPCProvider>
  );
}
