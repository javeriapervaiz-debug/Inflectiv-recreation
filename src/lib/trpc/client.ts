import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/trpc';

/**
 * tRPC React client
 * Use this in React components with the TRPCProvider
 */
export const trpc = createTRPCReact<AppRouter>();
