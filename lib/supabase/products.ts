import { supabase } from './client';
import { Database } from './types';

export type Product = Database['public']['Tables']['products']['Row'];
export type NewProduct = Database['public']['Tables']['products']['Insert'];
export type UpdateProduct = Database['public']['Tables']['products']['Update'];

export const createProduct = async (product: NewProduct) => {
    const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getProduct = async (id: number) => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export const updateProduct = async (id: number, updates: UpdateProduct) => {
    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteProduct = async (id: number) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const getProductsBySeller = async (sellerId: number) => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId);

    if (error) throw error;
    return data;
};
