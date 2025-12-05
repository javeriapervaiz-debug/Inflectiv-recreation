import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/server/supabase';
import { isMockModeEnabled, getMockTopAssets } from '@/lib/mock/earnings';

/**
 * GET /api/earnings/top-assets
 * Get top performing assets for a wallet address
 *
 * Query params:
 * - walletAddress: User's wallet address (required)
 * - limit: Number of assets to return (default: 5)
 *
 * Set USE_MOCK_DATA=true in env for demo data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '5'), 1), 10);

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
        data: getMockTopAssets(limit),
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Get all transactions where user is the seller, grouped by asset
    const { data: transactionsData, error } = await supabaseAdmin
      .from('transactions')
      .select('asset_id, asset_name, asset_token_id, seller_amount_display, token_amount')
      .eq('seller_address', normalizedAddress)
      .eq('status', 'confirmed');

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Aggregate by asset
    const assetMap = new Map<
      string,
      {
        assetId: string;
        assetName: string;
        assetTokenId: string;
        totalEarned: number;
        totalTokensSold: number;
        transactionCount: number;
      }
    >();

    for (const tx of transactionsData || []) {
      const key = tx.asset_id || tx.asset_token_id;
      if (!key) continue;

      const existing = assetMap.get(key);
      if (existing) {
        existing.totalEarned += parseFloat(tx.seller_amount_display) || 0;
        existing.totalTokensSold += tx.token_amount || 0;
        existing.transactionCount += 1;
      } else {
        assetMap.set(key, {
          assetId: tx.asset_id,
          assetName: tx.asset_name || 'Unknown Asset',
          assetTokenId: tx.asset_token_id || '',
          totalEarned: parseFloat(tx.seller_amount_display) || 0,
          totalTokensSold: tx.token_amount || 0,
          transactionCount: 1,
        });
      }
    }

    // Sort by total earned and take top N
    const topAssets = Array.from(assetMap.values())
      .sort((a, b) => b.totalEarned - a.totalEarned)
      .slice(0, limit)
      .map((asset, index) => ({
        rank: index + 1,
        assetId: asset.assetId,
        assetName: asset.assetName,
        assetTokenId: asset.assetTokenId,
        totalEarned: asset.totalEarned.toFixed(4),
        totalTokensSold: asset.totalTokensSold,
        transactionCount: asset.transactionCount,
      }));

    return NextResponse.json({
      success: true,
      data: {
        topAssets,
        currency: 'MATIC',
      },
    });
  } catch (error) {
    console.error('Top assets error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
