import { supabase } from './client';
import { Database } from './types';

export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type PurchaseWithProduct = Database['public']['Tables']['purchases']['Row'] & {
    products: Database['public']['Tables']['products']['Row'] | null;
};

export async function createProduct(product: ProductInsert) {
    const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function getProductById(id: number) {
    const { data, error } = await supabase
        .from('products')
        .select('*, sellers(wallet)')
        .eq('id', id)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function getRecentPurchases() {
    const { data, error } = await supabase
        .from('purchases')
        .select('*, products(*)')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        throw error;
    }

    return data as PurchaseWithProduct[];
}

export async function getSellerProducts(sellerId: number) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}

export async function getSellerStats(sellerId: number) {
    // Get total earned and unique buyers
    const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('amount_usd, buyer_wallet, products!inner(seller_id)')
        .eq('products.seller_id', sellerId);

    if (purchasesError) throw purchasesError;

    const totalEarned = purchases?.reduce((sum, p) => sum + p.amount_usd, 0) || 0;
    const buyers = new Set(purchases?.map((p) => p.buyer_wallet)).size;

    // Get average rating
    const { data: ratings, error: ratingsError } = await supabase
        .from('seller_ratings')
        .select('rating')
        .eq('seller_id', sellerId);

    if (ratingsError) throw ratingsError;

    const avgStars =
        ratings && ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

    return {
        totalEarned,
        pending: 0, // No pending logic in schema yet
        buyers,
        avgStars,
        trustTags: ["fast replies", "deep research", "base native"], // Static for now
    };
}
