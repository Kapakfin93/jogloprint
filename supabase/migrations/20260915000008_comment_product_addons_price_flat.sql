-- ==========================================================
-- Migration: 20260915000008_comment_product_addons_price_flat.sql
-- Description: Add architectural contextual documentation comment on product_addons.price_flat
-- ==========================================================

COMMENT ON COLUMN public.product_addons.price_flat IS 'Harga add-on. Diinterpretasikan kontekstual sesuai products.pricing_model: untuk engine area bermakna Rp/m² (proporsional terhadap luas billedAreaM2); untuk engine sheet/bundle/meter_lari bermakna Rp flat per pcs/lembar/buku/meter.';
