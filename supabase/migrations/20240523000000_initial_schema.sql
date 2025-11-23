-- 1) Sellers: one row per seller (wallet is the identity; FID optional)
CREATE TABLE IF NOT EXISTS public.sellers (
    id         BIGSERIAL PRIMARY KEY,
    wallet     TEXT NOT NULL UNIQUE,  -- store lowercase hex
    fid        BIGINT,                -- optional Farcaster FID
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Products: text blob + price, owned by a seller
CREATE TABLE IF NOT EXISTS public.products (
    id         BIGSERIAL PRIMARY KEY,

    seller_id  BIGINT NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,

    content    TEXT NOT NULL,              -- the actual info being sold
    price_usd  DECIMAL(10,2) NOT NULL,     -- stored in dollars

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id
    ON public.products (seller_id);

-- 3) Purchases: lifetime access per (product, buyer_wallet)
CREATE TABLE IF NOT EXISTS public.purchases (
    id           BIGSERIAL PRIMARY KEY,

    product_id   BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,

    buyer_wallet TEXT NOT NULL,            -- lowercase hex
    buyer_fid    BIGINT,                   -- optional

    amount_usd   DECIMAL(10,2) NOT NULL,   -- what they actually paid
    created_at   TIMESTAMPTZ DEFAULT now(),

    -- one lifetime access per wallet per product
    UNIQUE (product_id, buyer_wallet)
);

CREATE INDEX IF NOT EXISTS idx_purchases_buyer_wallet
    ON public.purchases (buyer_wallet);

-- 4) Seller ratings: one rating per (seller, buyer_wallet)
CREATE TABLE IF NOT EXISTS public.seller_ratings (
    id           BIGSERIAL PRIMARY KEY,

    seller_id    BIGINT NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    buyer_wallet TEXT NOT NULL,                -- who rated

    rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment      TEXT,
    created_at   TIMESTAMPTZ DEFAULT now(),

    -- one rating per buyer per seller
    UNIQUE (seller_id, buyer_wallet)
);

CREATE INDEX IF NOT EXISTS idx_seller_ratings_seller_id
    ON public.seller_ratings (seller_id);

-- Alter table to add title and description as per user request
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
