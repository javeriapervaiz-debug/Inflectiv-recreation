import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { supabase } from '@/server/supabase';
import { isMockModeEnabled, MOCK_ASSETS, MOCK_SELLER_ADDRESS } from '@/lib/mock/earnings';

/**
 * Asset router
 * Handles tokenized data asset operations
 *
 * Set USE_MOCK_DATA=true in env for demo data
 */
export const assetRouter = createTRPCRouter({
  // Get all assets for a user
  getByUser: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', input.userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch assets: ${error.message}`,
        });
      }

      return data ?? [];
    }),

  // Get single asset by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          user:users(id, username, display_name, avatar_url)
        `)
        .eq('id', input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Asset not found: ${error.message}`,
        });
      }

      return data;
    }),

  // Get asset by token ID
  getByTokenId: publicProcedure
    .input(z.object({ tokenId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          user:users(id, username, display_name, avatar_url)
        `)
        .eq('token_id', input.tokenId)
        .single();

      if (error) {
        return null;
      }

      return data;
    }),

  // Get all listed assets (marketplace)
  getListed: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      // Return mock data if enabled (for demos)
      if (isMockModeEnabled()) {
        let mockAssets = MOCK_ASSETS.map((asset) => ({
          id: asset.id,
          user_id: '00000000-0000-0000-0000-000000000001',
          token_id: asset.tokenId,
          blockchain_token_id: asset.blockchainTokenId,
          name: asset.name,
          description: asset.description,
          category: asset.category,
          tags: [],
          structured_data: {},
          original_filename: null,
          file_type: null,
          file_size: null,
          price: null,
          currency: 'MATIC',
          is_listed: true,
          is_minted: true,
          views: Math.floor(Math.random() * 500) + 50,
          downloads: 0,
          status: 'active',
          ipfs_hash: null,
          storage_url: null,
          access_token_address: `0xAccessToken${asset.blockchainTokenId}`,
          mint_transaction_hash: `0xMintTx${asset.blockchainTokenId}`,
          listing_id: asset.blockchainTokenId,
          listing_price: null,
          available_access_tokens: 100,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          user: {
            id: '00000000-0000-0000-0000-000000000001',
            username: 'demo_seller',
            display_name: 'Demo Seller',
            avatar_url: null,
            wallet_address: MOCK_SELLER_ADDRESS,
          },
        }));

        // Filter by category if specified
        if (input.category) {
          mockAssets = mockAssets.filter((a) => a.category === input.category);
        }

        // Apply pagination
        const total = mockAssets.length;
        const paginatedAssets = mockAssets.slice(input.offset, input.offset + input.limit);

        return {
          assets: paginatedAssets,
          total,
          hasMore: total > input.offset + input.limit,
        };
      }

      let query = supabase
        .from('assets')
        .select(`
          *,
          user:users(id, username, display_name, avatar_url)
        `, { count: 'exact' })
        .eq('is_listed', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.category) {
        query = query.eq('category', input.category);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch listed assets: ${error.message}`,
        });
      }

      return {
        assets: data ?? [],
        total: count ?? 0,
        hasMore: (count ?? 0) > input.offset + input.limit,
      };
    }),

  // Create a new asset
  create: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        tokenId: z.string(),
        name: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).default([]),
        structuredData: z.record(z.string(), z.unknown()).default({}),
        originalFilename: z.string().optional(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from('assets')
        .insert({
          user_id: input.userId,
          token_id: input.tokenId,
          name: input.name,
          description: input.description,
          category: input.category,
          tags: input.tags,
          structured_data: input.structuredData,
          original_filename: input.originalFilename,
          file_type: input.fileType,
          file_size: input.fileSize,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create asset: ${error.message}`,
        });
      }

      return data;
    }),

  // Update asset
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().max(2000).optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        price: z.number().min(0).optional(),
        currency: z.string().optional(),
        isListed: z.boolean().optional(),
        status: z.enum(['draft', 'processing', 'active', 'archived']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from('assets')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          tags: updates.tags,
          price: updates.price,
          currency: updates.currency,
          is_listed: updates.isListed,
          status: updates.status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update asset: ${error.message}`,
        });
      }

      return data;
    }),

  // Delete asset
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to delete asset: ${error.message}`,
        });
      }

      return { success: true };
    }),

  // Increment view count
  incrementViews: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase.rpc('increment_views', {
        asset_id: input.id,
      });

      // If RPC doesn't exist, fall back to manual update
      if (error) {
        const { data: asset } = await supabase
          .from('assets')
          .select('views')
          .eq('id', input.id)
          .single();

        if (asset) {
          await supabase
            .from('assets')
            .update({ views: (asset.views || 0) + 1 })
            .eq('id', input.id);
        }
      }

      return { success: true };
    }),
});
