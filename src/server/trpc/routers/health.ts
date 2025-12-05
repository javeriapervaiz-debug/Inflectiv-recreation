import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

/**
 * Health check router
 * Use this to verify the tRPC connection is working
 */
export const healthRouter = createTRPCRouter({
  // Simple ping endpoint
  ping: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Echo endpoint for testing input/output
  echo: publicProcedure
    .input(z.object({ message: z.string() }))
    .query(({ input }) => {
      return { echo: input.message, receivedAt: new Date().toISOString() };
    }),
});
