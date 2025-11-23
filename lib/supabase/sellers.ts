import { supabase } from './client';
import { Database } from './types';

export type Seller = Database['public']['Tables']['sellers']['Row'];
export type NewSeller = Database['public']['Tables']['sellers']['Insert'];

export const createSeller = async (seller: NewSeller) => {
    const { data, error } = await supabase
        .from('sellers')
        .insert(seller)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getSellerByWallet = async (wallet: string) => {
    const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('wallet', wallet)
        .maybeSingle();

    if (error) throw error;
    return data;
};

export const getSellerByFid = async (fid: number) => {
    const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('fid', fid)
        .maybeSingle();

    if (error) throw error;
    return data;
};
