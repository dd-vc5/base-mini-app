export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: number
                    seller_id: number
                    content: string
                    price_usd: number
                    created_at: string
                    title: string
                    description: string
                }
                Insert: {
                    id?: number
                    seller_id: number
                    content: string
                    price_usd: number
                    created_at?: string
                    title: string
                    description: string
                }
                Update: {
                    id?: number
                    seller_id?: number
                    content?: string
                    price_usd?: number
                    created_at?: string
                    title?: string
                    description?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "products_seller_id_fkey"
                        columns: ["seller_id"]
                        referencedRelation: "sellers"
                        referencedColumns: ["id"]
                    }
                ]
            }
            purchases: {
                Row: {
                    id: number
                    product_id: number
                    buyer_wallet: string
                    buyer_fid: number | null
                    amount_usd: number
                    created_at: string
                }
                Insert: {
                    id?: number
                    product_id: number
                    buyer_wallet: string
                    buyer_fid?: number | null
                    amount_usd: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    product_id?: number
                    buyer_wallet?: string
                    buyer_fid?: number | null
                    amount_usd?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "purchases_product_id_fkey"
                        columns: ["product_id"]
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    }
                ]
            }
            seller_ratings: {
                Row: {
                    id: number
                    seller_id: number
                    buyer_wallet: string
                    rating: number
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    seller_id: number
                    buyer_wallet: string
                    rating: number
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    seller_id?: number
                    buyer_wallet?: string
                    rating?: number
                    comment?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "seller_ratings_seller_id_fkey"
                        columns: ["seller_id"]
                        referencedRelation: "sellers"
                        referencedColumns: ["id"]
                    }
                ]
            }
            sellers: {
                Row: {
                    id: number
                    wallet: string
                    fid: number | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    wallet: string
                    fid?: number | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    wallet?: string
                    fid?: number | null
                    created_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
