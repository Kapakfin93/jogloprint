-- ==========================================================
-- Migration: 20260913000007_rename_min_order_qty_and_comments.sql
-- Description: Rename min_order_area to min_order_qty + add architectural comments in DB
-- ==========================================================

-- 1. Add contextual documentation comment on variant_price_tiers.price_per_unit
COMMENT ON COLUMN public.variant_price_tiers.price_per_unit IS 'Makna kontekstual sesuai products.pricing_model: sheet/bundle=Rp per lembar-pcs, area=Rp per m², meter_lari=Rp per meter. SELALU join ke products.pricing_model sebelum menafsirkan nilai ini.';

-- 2. Rename min_order_area to min_order_qty (generic for m², meter, or pcs)
ALTER TABLE public.products
RENAME COLUMN min_order_area TO min_order_qty;

COMMENT ON COLUMN public.products.min_order_qty IS 'Batas minimum perhitungan pemesanan: area=m² minimal (default 1.0), meter_lari=meter minimal (default 1.0), sheet/bundle=default 1.0.';

-- 3. Update duplicate_product RPC to reference min_order_qty
CREATE OR REPLACE FUNCTION public.duplicate_product(
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
    SELECT * INTO orig_prod FROM public.products WHERE id = source_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Source product with ID % not found', source_id;
    END IF;

    final_name := COALESCE(p_name, orig_prod.name || ' (Salinan)');
    final_slug := COALESCE(p_slug, orig_prod.slug || '-salinan-' || substr(md5(random()::text), 1, 6));

    -- 1. Insert duplicate product
    INSERT INTO public.products (
        category_id,
        slug,
        name,
        description,
        unit_label,
        pricing_model,
        min_order_qty,
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
        orig_prod.min_order_qty,
        orig_prod.specifications,
        orig_prod.display_order + 1,
        orig_prod.is_active
    ) RETURNING id INTO new_prod_id;

    -- 2. Duplicate product images
    INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, display_order)
    SELECT new_prod_id, image_url, alt_text, is_primary, display_order
    FROM public.product_images
    WHERE product_id = source_id;

    -- 3. Duplicate product addons
    INSERT INTO public.product_addons (product_id, name, description, price_flat, is_default, display_order)
    SELECT new_prod_id, name, description, price_flat, is_default, display_order
    FROM public.product_addons
    WHERE product_id = source_id;

    -- 4. Duplicate variants and their price tiers
    FOR v_record IN SELECT * FROM public.product_variants WHERE product_id = source_id ORDER BY display_order ASC LOOP
        INSERT INTO public.product_variants (
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
        INSERT INTO public.variant_price_tiers (
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
        FROM public.variant_price_tiers
        WHERE variant_id = v_record.id;
    END LOOP;

    RETURN new_prod_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
