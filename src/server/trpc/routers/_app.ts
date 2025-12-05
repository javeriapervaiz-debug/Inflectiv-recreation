import { createTRPCRouter } from '../trpc';
import { healthRouter } from './health';
import { userRouter } from './user';
import { assetRouter } from './asset';

/**
 * Root router
 * All sub-routers are merged here
 */
export const appRouter = createTRPCRouter({
  health: healthRouter,
  user: userRouter,
  asset: assetRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
