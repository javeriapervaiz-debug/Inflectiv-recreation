import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/server/supabase';
import { isMockModeEnabled, getMockTransactions } from '@/lib/mock/earnings';

/**
 * GET /api/earnings/transactions
 * Get transaction history for a wallet address
 *
 * Query params:
 * - walletAddress: User's wallet address (required)
 * - type: Filter by 'sale' | 'royalty' | 'all' (default: 'all')
 * - limit: Number of transactions to return (default: 20)
 * - offset: Pagination offset (default: 0)
 *
 * Set USE_MOCK_DATA=true in env for demo data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const type = (searchParams.get('type') || 'all') as 'all' | 'sale' | 'royalty';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required param: walletAddress' },
        { status: 400 }
      );
    }

    // Return mock data if enabled (for demos)
    if (isMockModeEnabled()) {
      return NextResponse.json({
        success: true,
        data: getMockTransactions(type, limit, offset),
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Build query based on type
    let transactions: any[] = [];
    let totalCount = 0;

    if (type === 'sale' || type === 'all') {
      // Get sales where user is the seller
      const { data: salesData, count: salesCount } = await supabaseAdmin
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('seller_address', normalizedAddress)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (salesData) {
        transactions = [
          ...transactions,
          ...salesData.map((tx) => ({
            ...tx,
            earning_type: 'sale',
            earned_amount: tx.seller_amount_display,
          })),
        ];
      }
      totalCount += salesCount || 0;
    }

    if (type === 'royalty' || type === 'all') {
      // Get royalties where user is the creator
      const { data: royaltyData, count: royaltyCount } = await supabaseAdmin
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('creator_address', normalizedAddress)
        .gt('royalty_amount_display', 0)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (royaltyData) {
        transactions = [
          ...transactions,
          ...royaltyData.map((tx) => ({
            ...tx,
            earning_type: 'royalty',
            earned_amount: tx.royalty_amount_display,
          })),
        ];
      }
      totalCount += royaltyCount || 0;
    }

    // Sort by date (newest first) and deduplicate by transaction_hash
    const uniqueTransactions = Array.from(
      new Map(transactions.map((tx) => [tx.transaction_hash, tx])).values()
    ).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Apply pagination to combined results
    const paginatedTransactions = uniqueTransactions.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        transactions: paginatedTransactions.map((tx) => ({
          id: tx.id,
          transactionHash: tx.transaction_hash,
          assetName: tx.asset_name,
          assetTokenId: tx.asset_token_id,
          earningType: tx.earning_type,
          earnedAmount: tx.earned_amount,
          totalAmount: tx.total_amount_display,
          tokenAmount: tx.token_amount,
          buyerAddress: tx.buyer_address,
          createdAt: tx.created_at,
          chainId: tx.chain_id,
        })),
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
    });
  } catch (error) {
    console.error('Earnings transactions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
