import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/server/supabase';
import { formatEther } from 'ethers';

/**
 * POST /api/earnings/record
 * Record a new transaction from a marketplace purchase event
 *
 * This endpoint is called after a successful purchase to record the transaction
 * in the database for earnings tracking.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      transactionHash,
      blockNumber,
      listingId,
      datasetTokenId,
      sellerAddress,
      buyerAddress,
      creatorAddress,
      tokenAmount,
      totalPrice,
      platformFee,
      royaltyAmount,
      sellerProceeds,
      pricePerToken,
      chainId,
    } = body;

    // Validate required fields
    if (!transactionHash || !sellerAddress || !buyerAddress || !totalPrice) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if transaction already exists
    const { data: existing } = await supabaseAdmin
      .from('transactions')
      .select('id')
      .eq('transaction_hash', transactionHash)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Transaction already recorded',
        data: { id: existing.id },
      });
    }

    // Look up asset info from Supabase using blockchain_token_id
    let assetId = null;
    let assetName = null;
    let assetTokenId = null;

    if (datasetTokenId) {
      const { data: asset } = await supabaseAdmin
        .from('assets')
        .select('id, name, token_id')
        .eq('blockchain_token_id', datasetTokenId.toString())
        .single();

      if (asset) {
        assetId = asset.id;
        assetName = asset.name;
        assetTokenId = asset.token_id;
      }
    }

    // Convert wei values to display values
    const totalAmountDisplay = parseFloat(formatEther(totalPrice.toString()));
    const sellerAmountDisplay = parseFloat(formatEther(sellerProceeds?.toString() || '0'));
    const platformFeeDisplay = parseFloat(formatEther(platformFee?.toString() || '0'));
    const royaltyAmountDisplay = parseFloat(formatEther(royaltyAmount?.toString() || '0'));

    // Insert transaction
    const { data: transaction, error } = await supabaseAdmin
      .from('transactions')
      .insert({
        transaction_hash: transactionHash,
        block_number: blockNumber,
        asset_id: assetId,
        listing_id: listingId?.toString(),
        seller_address: sellerAddress.toLowerCase(),
        buyer_address: buyerAddress.toLowerCase(),
        creator_address: creatorAddress?.toLowerCase() || null,
        total_amount: totalPrice.toString(),
        seller_amount: sellerProceeds?.toString() || '0',
        platform_fee: platformFee?.toString() || '0',
        royalty_amount: royaltyAmount?.toString() || '0',
        total_amount_display: totalAmountDisplay,
        seller_amount_display: sellerAmountDisplay,
        platform_fee_display: platformFeeDisplay,
        royalty_amount_display: royaltyAmountDisplay,
        token_amount: tokenAmount || 1,
        price_per_token: pricePerToken?.toString(),
        asset_name: assetName,
        asset_token_id: assetTokenId,
        blockchain_token_id: datasetTokenId?.toString(),
        chain_id: chainId,
        status: 'confirmed',
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording transaction:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to record transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction recorded successfully',
      data: { id: transaction.id },
    });
  } catch (error) {
    console.error('Record transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
