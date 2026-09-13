-- ==========================================================
-- Migration: Add pricing_engine to categories & products + duplicate_product RPC
-- ==========================================================

-- 1. Add pricing_engine to categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS pricing_engine VARCHAR(30) NOT NULL DEFAULT 'sheet';

-- Set Banner category to 'area'
UPDATE categories 
SET pricing_engine = 'area' 
WHERE slug LIKE '%banner%' OR slug LIKE '%spanduk%' OR name ILIKE '%banner%';

-- 2. Add pricing_model & min_order_area to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS pricing_model VARCHAR(30) DEFAULT 'sheet',
ADD COLUMN IF NOT EXISTS min_order_area NUMERIC(10,2) DEFAULT 1.0;

-- Sync existing products pricing_model with their category pricing_engine
UPDATE products p
SET pricing_model = c.pricing_engine
FROM categories c
WHERE p.category_id = c.id;

-- 3. Stored Procedure for Atomic, High-Performance Product Duplication (ACID Safe)
CREATE OR REPLACE FUNCTION duplicate_product(
    source_id UUID,
    p_name TEXT DEFAULT NULL,
    p_slug TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_prod_id UUID;
    v_record RECORD;
    new_var_id UUID;
    t_record RECORD;
    orig_prod RECORD;
    final_name TEXT;
    final_slug TEXT;
BEGIN
    -- Fetch original product
    SELECT * INTO orig_prod FROM products WHERE id = source_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Source product with ID % not found', source_id;
    END IF;

    final_name := COALESCE(p_name, orig_prod.name || ' (Salinan)');
    final_slug := COALESCE(p_slug, orig_prod.slug || '-salinan-' || substr(md5(random()::text), 1, 6));

    -- 1. Insert duplicate product
    INSERT INTO products (
        category_id,
        slug,
        name,
        description,
        unit_label,
        pricing_model,
        min_order_area,
        specifications,
        display_order,
        is_active
    ) VALUES (
        orig_prod.category_id,
        final_slug,
        final_name,
        orig_prod.description,
        orig_prod.unit_label,
        orig_prod.pricing_model,
        orig_prod.min_order_area,
        orig_prod.specifications,
        orig_prod.display_order + 1,
        orig_prod.is_active
    ) RETURNING id INTO new_prod_id;

    -- 2. Duplicate product images
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
    SELECT new_prod_id, image_url, alt_text, is_primary, display_order
    FROM product_images
    WHERE product_id = source_id;

    -- 3. Duplicate product addons
    INSERT INTO product_addons (product_id, name, description, price_flat, is_default, display_order)
    SELECT new_prod_id, name, description, price_flat, is_default, display_order
    FROM product_addons
    WHERE product_id = source_id;

    -- 4. Duplicate variants and their price tiers
    FOR v_record IN SELECT * FROM product_variants WHERE product_id = source_id ORDER BY display_order ASC LOOP
        INSERT INTO product_variants (
            product_id,
            variant_name,
            description,
            sku,
            is_default,
            display_order
        ) VALUES (
            new_prod_id,
            v_record.variant_name,
            v_record.description,
            NULL, -- Reset SKU
            v_record.is_default,
            v_record.display_order
        ) RETURNING id INTO new_var_id;

        -- Duplicate tiers for this variant
        INSERT INTO variant_price_tiers (
            variant_id,
            min_qty,
            max_qty,
            price_per_unit,
            lead_time_days,
            discount_label,
            display_order
        )
        SELECT 
            new_var_id,
            min_qty,
            max_qty,
            price_per_unit,
            lead_time_days,
            discount_label,
            display_order
        FROM variant_price_tiers
        WHERE variant_id = v_record.id;
    END LOOP;

    RETURN new_prod_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
