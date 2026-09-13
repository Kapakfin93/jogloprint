-- Migration: 20260913000001_initial_schema.sql
-- Project: Joglo Print Web & Admin Catalog
-- Description: Initial schema for categories, products, variants, price tiers, addons, images, and business_info with strict RLS.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. product_variants (Finishing: Kiss Cut, Die Cut, Tanpa Potong, dsb)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    is_default BOOLEAN DEFAULT false NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. variant_price_tiers (Tabel Harga Grosir Bertingkat)
CREATE TABLE IF NOT EXISTS public.variant_price_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    min_qty INTEGER NOT NULL CHECK (min_qty >= 1),
    max_qty INTEGER CHECK (max_qty IS NULL OR max_qty >= min_qty),
    price_per_unit NUMERIC(12, 2) NOT NULL CHECK (price_per_unit >= 0),
    lead_time_days VARCHAR(100),
    discount_label VARCHAR(100),
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. product_addons (Laminasi / Add-on Flat)
CREATE TABLE IF NOT EXISTS public.product_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_flat NUMERIC(12, 2) DEFAULT 0 NOT NULL CHECK (price_flat >= 0),
    is_default BOOLEAN DEFAULT false NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. product_images
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. business_info (Identitas Toko & WhatsApp Order)
CREATE TABLE IF NOT EXISTS public.business_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Joglo Print Demak',
    tagline TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Demak' NOT NULL,
    postal_code VARCHAR(20) DEFAULT '59571',
    whatsapp_number VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    opening_hours JSONB DEFAULT '{"mon_sat": "08:00 - 21:00 WIB", "sun": "09:00 - 17:00 WIB"}'::jsonb,
    shipping_coverage TEXT[] DEFAULT ARRAY['Demak & Sekitarnya: Mranggen, Karangawen, Sayung, Demak Kota', 'Kudus, Jepara, Semarang: Travel / Pengiriman Semalam', 'Seluruh Jawa Tengah: J&T, JNE, SiCepat, Lion Parcel & Indah Cargo'],
    google_maps_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON public.products(display_order);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_display_order ON public.product_variants(display_order);

CREATE INDEX IF NOT EXISTS idx_variant_price_tiers_variant_id ON public.variant_price_tiers(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_price_tiers_min_qty ON public.variant_price_tiers(min_qty);

CREATE INDEX IF NOT EXISTS idx_product_addons_product_id ON public.product_addons(product_id);
CREATE INDEX IF NOT EXISTS idx_product_addons_display_order ON public.product_addons(display_order);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON public.product_images(display_order);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER set_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_business_info_updated_at ON public.business_info;
CREATE TRIGGER set_business_info_updated_at
BEFORE UPDATE ON public.business_info
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_price_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_info ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read-only categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated admin manage categories" ON public.categories;

DROP POLICY IF EXISTS "Public read-only products" ON public.products;
DROP POLICY IF EXISTS "Authenticated admin manage products" ON public.products;

DROP POLICY IF EXISTS "Public read-only product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Authenticated admin manage product_variants" ON public.product_variants;

DROP POLICY IF EXISTS "Public read-only variant_price_tiers" ON public.variant_price_tiers;
DROP POLICY IF EXISTS "Authenticated admin manage variant_price_tiers" ON public.variant_price_tiers;

DROP POLICY IF EXISTS "Public read-only product_addons" ON public.product_addons;
DROP POLICY IF EXISTS "Authenticated admin manage product_addons" ON public.product_addons;

DROP POLICY IF EXISTS "Public read-only product_images" ON public.product_images;
DROP POLICY IF EXISTS "Authenticated admin manage product_images" ON public.product_images;

DROP POLICY IF EXISTS "Public read-only business_info" ON public.business_info;
DROP POLICY IF EXISTS "Authenticated admin manage business_info" ON public.business_info;

-- RLS Policies: Public READ (SELECT)
CREATE POLICY "Public read-only categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read-only products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read-only product_variants" ON public.product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read-only variant_price_tiers" ON public.variant_price_tiers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read-only product_addons" ON public.product_addons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read-only product_images" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read-only business_info" ON public.business_info FOR SELECT TO anon, authenticated USING (true);

-- RLS Policies: Authenticated Admin ALL (INSERT, UPDATE, DELETE)
CREATE POLICY "Authenticated admin manage categories" ON public.categories FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin manage products" ON public.products FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin manage product_variants" ON public.product_variants FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin manage variant_price_tiers" ON public.variant_price_tiers FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin manage product_addons" ON public.product_addons FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin manage product_images" ON public.product_images FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin manage business_info" ON public.business_info FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
