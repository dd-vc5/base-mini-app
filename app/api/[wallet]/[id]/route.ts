import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/supabase/products';
import { getSellerByWallet } from '@/lib/supabase/sellers';
import { withX402 } from 'x402-next';
import { getAddress } from 'viem';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ wallet: string; id: string }> }
) {
    const { wallet: sellerWallet, id: productIdStr } = await params;
    const productId = parseInt(productIdStr, 10);

    if (isNaN(productId)) {
        return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // 1. Verify Seller Exists
    try {
        const seller = await getSellerByWallet(sellerWallet);
        if (!seller) {
            return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error fetching seller:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // 2. Get Product Details
    let product;
    try {
        product = await getProduct(productId);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // 3. Define the protected handler
    const protectedHandler = async () => {
        return NextResponse.json({
            content: product.content,
            title: product.title,
            description: product.description,
        });
    };

    // 4. Wrap with x402
    // We cast sellerWallet to Address (assuming it's a valid EVM address as per schema)
    const wrappedHandler = withX402(
        protectedHandler,
        getAddress(sellerWallet),
        {
            price: `${product.price_usd}`, // Ensure string format
            network: 'base-sepolia', // Using Base Sepolia testnet
            config: {
                description: product.title || 'Product Access',
                outputSchema: {
                    type: 'object',
                    properties: {
                        content: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                    },
                },
            },
        },
        {
            url: "https://x402.org/facilitator", // for testnet
        }
    );

    // 5. Execute the wrapped handler
    return wrappedHandler(request);
}
