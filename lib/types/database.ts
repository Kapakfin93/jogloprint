export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PricingEngine = "sheet" | "area" | "meter_lari" | "bundle";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  pricing_engine: PricingEngine;
  cover_image_url: string | null;
  icon_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomeBanner {
  id: string;
  image_url: string;
  link_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Struktur Generik: Array of { label, value }
export interface ProductSpecificationItem {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  unit_label: string | null;
  pricing_model: PricingEngine;
  min_order_qty: number | null;
  specifications: ProductSpecificationItem[] | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  description: string | null;
  sku: string | null;
  is_default: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface VariantPriceTier {
  id: string;
  variant_id: string;
  min_qty: number;
  max_qty: number | null;
  price_per_unit: number;
  lead_time_days: string | null;
  discount_label: string | null;
  display_order: number;
  created_at: string;
}

export interface ProductAddon {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
  price_flat: number;
  is_default: boolean;
  display_order: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  file_hash: string | null;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface BusinessInfo {
  id: string;
  name: string;
  tagline: string | null;
  address: string;
  city: string;
  postal_code: string;
  whatsapp_number: string;
  phone: string | null;
  email: string | null;
  opening_hours: Record<string, string> | null;
  shipping_coverage: string[] | null;
  google_maps_url: string | null;
  created_at: string;
  updated_at: string;
}
