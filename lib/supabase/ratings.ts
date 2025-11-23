import { supabase } from './client';
import { Database } from './types';

export type Rating = Database['public']['Tables']['seller_ratings']['Row'];
export type NewRating = Database['public']['Tables']['seller_ratings']['Insert'];

export const createRating = async (rating: NewRating) => {
    const { data, error } = await supabase
        .from('seller_ratings')
        .insert(rating)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getRatingsBySeller = async (sellerId: number) => {
    const { data, error } = await supabase
        .from('seller_ratings')
        .select('*')
        .eq('seller_id', sellerId);

    if (error) throw error;
    return data;
};
