import { supabase } from './client';
import { Database } from './types';

export type Purchase = Database['public']['Tables']['purchases']['Row'];
export type NewPurchase = Database['public']['Tables']['purchases']['Insert'];

export const createPurchase = async (purchase: NewPurchase) => {
    const { data, error } = await supabase
        .from('purchases')
        .insert(purchase)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getPurchasesByBuyer = async (buyerWallet: string) => {
    const { data, error } = await supabase
        .from('purchases')
        .select('*, products(*)')
        .eq('buyer_wallet', buyerWallet);

    if (error) throw error;
    return data;
};

export const getPurchasesByProduct = async (productId: number) => {
    const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('product_id', productId);

    if (error) throw error;
    return data;
};

export const checkPurchase = async (productId: number, buyerWallet: string) => {
    const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('product_id', productId)
        .eq('buyer_wallet', buyerWallet)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "The result contains 0 rows"
    return !!data;
};
