/**
 * Supabase Database Types
 * These types match the schema defined in supabase/schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          wallet_address: string | null;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_verified: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          wallet_address?: string | null;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          wallet_address?: string | null;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          user_id: string;
          token_id: string;
          name: string;
          description: string | null;
          category: string | null;
          tags: string[];
          structured_data: Json;
          original_filename: string | null;
          file_type: string | null;
          file_size: number | null;
          price: number | null;
          currency: string;
          is_listed: boolean;
          views: number;
          downloads: number;
          status: 'draft' | 'processing' | 'active' | 'archived';
          ipfs_hash: string | null;
          storage_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_id: string;
          name: string;
          description?: string | null;
          category?: string | null;
          tags?: string[];
          structured_data?: Json;
          original_filename?: string | null;
          file_type?: string | null;
          file_size?: number | null;
          price?: number | null;
          currency?: string;
          is_listed?: boolean;
          views?: number;
          downloads?: number;
          status?: 'draft' | 'processing' | 'active' | 'archived';
          ipfs_hash?: string | null;
          storage_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          tags?: string[];
          structured_data?: Json;
          original_filename?: string | null;
          file_type?: string | null;
          file_size?: number | null;
          price?: number | null;
          currency?: string;
          is_listed?: boolean;
          views?: number;
          downloads?: number;
          status?: 'draft' | 'processing' | 'active' | 'archived';
          ipfs_hash?: string | null;
          storage_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Helper types for easier usage
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Asset = Database['public']['Tables']['assets']['Row'];
export type AssetInsert = Database['public']['Tables']['assets']['Insert'];
export type AssetUpdate = Database['public']['Tables']['assets']['Update'];

// Asset with user relation
export type AssetWithUser = Asset & {
  user: User | null;
};
