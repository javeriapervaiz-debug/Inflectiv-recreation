import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/server/supabase';
import { isMockModeEnabled, getMockEarningsSummary } from '@/lib/mock/earnings';

/**
 * GET /api/earnings/summary
 * Get earnings summary for a wallet address
 *
 * Query params:
 * - walletAddress: User's wallet address (required)
 *
 * Set USE_MOCK_DATA=true in env for demo data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

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
        data: getMockEarningsSummary(),
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Get sales earnings (as seller)
    const { data: salesData, error: salesError } = await supabaseAdmin
      .from('transactions')
      .select('seller_amount_display, created_at')
      .eq('seller_address', normalizedAddress)
      .eq('status', 'confirmed');

    if (salesError) {
      console.error('Error fetching sales:', salesError);
    }

    // Get royalty earnings (as creator)
    const { data: royaltyData, error: royaltyError } = await supabaseAdmin
      .from('transactions')
      .select('royalty_amount_display, created_at')
      .eq('creator_address', normalizedAddress)
      .eq('status', 'confirmed')
      .gt('royalty_amount_display', 0);

    if (royaltyError) {
      console.error('Error fetching royalties:', royaltyError);
    }

    // Calculate totals
    const sales = salesData || [];
    const royalties = royaltyData || [];

    const totalSalesEarnings = sales.reduce(
      (sum, tx) => sum + (parseFloat(tx.seller_amount_display) || 0),
      0
    );
    const totalRoyaltyEarnings = royalties.reduce(
      (sum, tx) => sum + (parseFloat(tx.royalty_amount_display) || 0),
      0
    );
    const totalEarnings = totalSalesEarnings + totalRoyaltyEarnings;

    // Calculate this month's earnings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthSales = sales
      .filter((tx) => new Date(tx.created_at) >= startOfMonth)
      .reduce((sum, tx) => sum + (parseFloat(tx.seller_amount_display) || 0), 0);

    const thisMonthRoyalties = royalties
      .filter((tx) => new Date(tx.created_at) >= startOfMonth)
      .reduce((sum, tx) => sum + (parseFloat(tx.royalty_amount_display) || 0), 0);

    const thisMonthEarnings = thisMonthSales + thisMonthRoyalties;

    // Get total tokens sold count
    const { data: tokensSoldData } = await supabaseAdmin
      .from('transactions')
      .select('token_amount')
      .eq('seller_address', normalizedAddress)
      .eq('status', 'confirmed');

    const totalTokensSold = (tokensSoldData || []).reduce(
      (sum, tx) => sum + (tx.token_amount || 0),
      0
    );

    // Get transaction counts
    const totalTransactions = sales.length + royalties.length;

    return NextResponse.json({
      success: true,
      data: {
        totalEarnings: totalEarnings.toFixed(4),
        totalSalesEarnings: totalSalesEarnings.toFixed(4),
        totalRoyaltyEarnings: totalRoyaltyEarnings.toFixed(4),
        thisMonthEarnings: thisMonthEarnings.toFixed(4),
        totalTransactions,
        totalSalesCount: sales.length,
        totalRoyaltiesCount: royalties.length,
        totalTokensSold,
        currency: 'MATIC',
      },
    });
  } catch (error) {
    console.error('Earnings summary error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
