import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

/**
 * Context creation for tRPC
 * This is where you'd add user session, database clients, etc.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    headers: opts.headers,
    // Add Supabase client here once auth is implemented
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Public (unauthenticated) procedure
 * Use this for endpoints that don't require authentication
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure - placeholder for future auth
 * This will be implemented when Web3Auth is added
 */
export const protectedProcedure = t.procedure;
// TODO: Add auth middleware when Web3Auth is implemented
// .use(({ ctx, next }) => {
//   if (!ctx.session?.user) {
//     throw new TRPCError({ code: 'UNAUTHORIZED' });
//   }
//   return next({ ctx: { ...ctx, user: ctx.session.user } });
// });
