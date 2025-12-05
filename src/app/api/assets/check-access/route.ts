import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/server/supabase';
import { checkDatasetAccess, getAccessBalance } from '@/lib/contracts';

/**
 * GET /api/assets/check-access
 * Check if a user has access to a specific asset
 *
 * Query params:
 * - assetId: Supabase asset ID
 * - walletAddress: User's wallet address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const walletAddress = searchParams.get('walletAddress');

    if (!assetId || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required params: assetId, walletAddress' },
        { status: 400 }
      );
    }

    // Get asset from Supabase
    const { data: asset, error: assetError } = await supabaseAdmin
      .from('assets')
      .select('id, user_id, blockchain_token_id, is_minted')
      .eq('id', assetId)
      .single();

    if (assetError || !asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    const isOwner = user?.id === asset.user_id;

    // If owner, they always have access
    if (isOwner) {
      return NextResponse.json({
        success: true,
        hasAccess: true,
        isOwner: true,
        accessLevel: 'owner',
        tokenBalance: 0,
      });
    }

    // If not minted, no one else has access
    if (!asset.is_minted || !asset.blockchain_token_id) {
      return NextResponse.json({
        success: true,
        hasAccess: false,
        isOwner: false,
        accessLevel: 'none',
        message: 'This dataset has not been minted yet',
      });
    }

    // Check blockchain access
    try {
      const tokenId = parseInt(asset.blockchain_token_id);
      const hasAccess = await checkDatasetAccess(tokenId, walletAddress);
      const balance = await getAccessBalance(tokenId, walletAddress);

      return NextResponse.json({
        success: true,
        hasAccess,
        isOwner: false,
        accessLevel: hasAccess ? 'token_holder' : 'none',
        tokenBalance: balance.accessUnits.toString(),
      });
    } catch (blockchainError) {
      console.error('Blockchain access check failed:', blockchainError);

      // Fallback: deny access if blockchain check fails
      return NextResponse.json({
        success: true,
        hasAccess: false,
        isOwner: false,
        accessLevel: 'none',
        message: 'Could not verify blockchain access',
      });
    }
  } catch (error) {
    console.error('Check access error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assets/check-access
 * Alternative endpoint for checking access with body params
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, walletAddress } = body;

    if (!assetId || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: assetId, walletAddress' },
        { status: 400 }
      );
    }

    // Reuse GET logic
    const url = new URL(request.url);
    url.searchParams.set('assetId', assetId);
    url.searchParams.set('walletAddress', walletAddress);

    const getRequest = new NextRequest(url.toString());
    return GET(getRequest);
  } catch (error) {
    console.error('Check access error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
