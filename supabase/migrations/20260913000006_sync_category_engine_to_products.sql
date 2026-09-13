-- Migration: 20260913000006_sync_category_engine_to_products.sql
-- Description: Trigger and sync function to keep product pricing_model synchronized with category pricing_engine

-- 1. Function to cascade update pricing_model on products when category pricing_engine changes
CREATE OR REPLACE FUNCTION public.sync_category_pricing_engine()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pricing_engine IS DISTINCT FROM OLD.pricing_engine THEN
    UPDATE public.products
    SET pricing_model = NEW.pricing_engine,
        unit_label = CASE 
          WHEN NEW.pricing_engine = 'area' AND (unit_label IS NULL OR unit_label = '' OR unit_label = 'lembar' OR unit_label = 'm lari') THEN 'm²'
          WHEN NEW.pricing_engine = 'meter_lari' AND (unit_label IS NULL OR unit_label = '' OR unit_label = 'lembar' OR unit_label = 'm²') THEN 'm lari'
          WHEN NEW.pricing_engine = 'sheet' AND (unit_label IS NULL OR unit_label = '' OR unit_label = 'm²' OR unit_label = 'm lari') THEN 'lembar'
          WHEN NEW.pricing_engine = 'bundle' AND (unit_label IS NULL OR unit_label = '' OR unit_label = 'm²') THEN 'buku'
          ELSE unit_label
        END,
        updated_at = NOW()
    WHERE category_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_category_pricing_engine ON public.categories;
CREATE TRIGGER trigger_sync_category_pricing_engine
AFTER UPDATE OF pricing_engine ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.sync_category_pricing_engine();

-- 2. Initial sync for all existing products to match their parent category pricing_engine
UPDATE public.products p
SET pricing_model = c.pricing_engine,
    unit_label = CASE 
      WHEN c.pricing_engine = 'area' AND (p.unit_label IS NULL OR p.unit_label = '' OR p.unit_label = 'lembar' OR p.unit_label = 'm lari') THEN 'm²'
      WHEN c.pricing_engine = 'meter_lari' AND (p.unit_label IS NULL OR p.unit_label = '' OR p.unit_label = 'lembar' OR p.unit_label = 'm²') THEN 'm lari'
      WHEN c.pricing_engine = 'sheet' AND (p.unit_label IS NULL OR p.unit_label = '' OR p.unit_label = 'm²' OR p.unit_label = 'm lari') THEN 'lembar'
      WHEN c.pricing_engine = 'bundle' AND (p.unit_label IS NULL OR p.unit_label = '' OR p.unit_label = 'm²') THEN 'buku'
      ELSE p.unit_label
    END
FROM public.categories c
WHERE p.category_id = c.id;
