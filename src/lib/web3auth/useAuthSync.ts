'use client';

import { useEffect, useRef, useState } from 'react';
import { useWeb3Auth } from './provider';
import { trpc } from '@/lib/trpc';

/**
 * Hook to sync Web3Auth user with database
 * Automatically creates or fetches user when wallet connects
 */
export function useAuthSync() {
  const { user, isConnected } = useWeb3Auth();
  const hasSynced = useRef(false);
  const [dbUser, setDbUser] = useState<unknown>(null);

  // Mutations and queries
  const { mutateAsync: createUser } = trpc.user.create.useMutation();
  const { refetch: refetchByWallet } = trpc.user.getByWallet.useQuery(
    { walletAddress: user?.walletAddress || '' },
    { enabled: false } // Manual fetch only
  );
  const { refetch: refetchByEmail } = trpc.user.getByEmail.useQuery(
    { email: user?.email || '' },
    { enabled: false } // Manual fetch only
  );

  useEffect(() => {
    const syncUser = async () => {
      if (!isConnected || !user?.walletAddress || hasSynced.current) return;

      try {
        // First check by wallet address
        const walletResult = await refetchByWallet();

        if (walletResult.data) {
          console.log('User found by wallet address');
          setDbUser(walletResult.data);
          hasSynced.current = true;
          return;
        }

        // If not found by wallet, check by email (if available)
        if (user.email) {
          const emailResult = await refetchByEmail();

          if (emailResult.data) {
            console.log('User found by email');
            setDbUser(emailResult.data);
            hasSynced.current = true;
            return;
          }
        }

        // User doesn't exist, create new one
        const newUser = await createUser({
          email: user.email,
          walletAddress: user.walletAddress,
          displayName: user.name,
        });
        console.log('Created new user in database');
        setDbUser(newUser);
        hasSynced.current = true;
      } catch (error) {
        console.error('Error syncing user:', error);
        // Mark as synced to prevent retry loops
        hasSynced.current = true;
      }
    };

    syncUser();
  }, [isConnected, user, refetchByWallet, refetchByEmail, createUser]);

  // Reset sync flag when user disconnects
  useEffect(() => {
    if (!isConnected) {
      hasSynced.current = false;
      setDbUser(null);
    }
  }, [isConnected]);

  return {
    dbUser,
    isReady: !!dbUser || !isConnected,
  };
}
