-- Migration: 20260913000005_fix_delete_and_duplicate_pipeline.sql
-- Description: Stored procedure for atomic and cascade-safe product deletion in Admin

CREATE OR REPLACE FUNCTION public.delete_product_admin(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Explicit cascade cleanup for complete safety
  DELETE FROM public.variant_price_tiers 
  WHERE variant_id IN (SELECT id FROM public.product_variants WHERE product_id = p_id);

  DELETE FROM public.product_variants WHERE product_id = p_id;
  DELETE FROM public.product_addons WHERE product_id = p_id;
  DELETE FROM public.product_images WHERE product_id = p_id;
  DELETE FROM public.products WHERE id = p_id;

  RETURN TRUE;
END;
$$;
