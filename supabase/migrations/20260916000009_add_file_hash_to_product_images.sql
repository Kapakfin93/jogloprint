-- Migration: Add file_hash to product_images for audit trail and duplicate detection
ALTER TABLE "public"."product_images" 
ADD COLUMN IF NOT EXISTS "file_hash" TEXT;

COMMENT ON COLUMN "public"."product_images"."file_hash" IS 'SHA-256 hash of the uploaded image file for duplicate audit trail';
