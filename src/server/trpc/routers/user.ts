import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { supabase, supabaseAdmin } from '@/server/supabase';

/**
 * User router
 * Handles user profile operations
 */
export const userRouter = createTRPCRouter({
  // Get user by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User not found: ${error.message}`,
        });
      }

      return data;
    }),

  // Get user by wallet address
  getByWallet: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', input.walletAddress)
        .single();

      if (error) {
        return null; // User not found is not an error here
      }

      return data;
    }),

  // Get user by email
  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', input.email)
        .single();

      if (error) {
        return null;
      }

      return data;
    }),

  // Create a new user
  create: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        walletAddress: z.string().optional(),
        username: z.string().min(3).max(30).optional(),
        displayName: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // At least one identifier required
      if (!input.email && !input.walletAddress) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Either email or wallet address is required',
        });
      }

      // Use admin client to bypass RLS for user creation
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          email: input.email,
          wallet_address: input.walletAddress,
          username: input.username,
          display_name: input.displayName,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create user: ${error.message}`,
        });
      }

      return data;
    }),

  // Update user profile
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        username: z.string().min(3).max(30).optional(),
        displayName: z.string().max(100).optional(),
        avatarUrl: z.string().url().optional(),
        bio: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from('users')
        .update({
          username: updates.username,
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl,
          bio: updates.bio,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update user: ${error.message}`,
        });
      }

      return data;
    }),
});
