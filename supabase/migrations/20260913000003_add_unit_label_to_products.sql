-- Migration: Add unit_label column to products table
-- Allows dynamic units per product (e.g., 'lembar', 'pcs', 'm²', 'box', 'buku', 'rangkap')

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS unit_label TEXT NULL;

-- Update existing pilot product to 'lembar'
UPDATE public.products
SET unit_label = 'lembar'
WHERE slug = 'stiker-kromo-a3';
