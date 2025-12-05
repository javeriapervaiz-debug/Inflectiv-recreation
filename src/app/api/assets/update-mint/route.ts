import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/server/supabase';

/**
 * POST /api/assets/update-mint
 * Updates an asset with blockchain minting information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, blockchainTokenId, accessTokenAddress, transactionHash } = body;

    if (!assetId || !blockchainTokenId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: assetId, blockchainTokenId' },
        { status: 400 }
      );
    }

    // Update the asset with blockchain info
    const { data, error } = await supabaseAdmin
      .from('assets')
      .update({
        blockchain_token_id: blockchainTokenId,
        access_token_address: accessTokenAddress,
        mint_transaction_hash: transactionHash,
        is_minted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assetId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update asset:', error);
      return NextResponse.json(
        { success: false, error: `Failed to update asset: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      asset: data,
    });
  } catch (error) {
    console.error('Update mint error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
