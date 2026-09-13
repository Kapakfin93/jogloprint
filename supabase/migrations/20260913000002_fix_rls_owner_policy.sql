-- Migration: 20260913000002_fix_rls_owner_policy.sql
-- Description: Restrict write operations strictly to verified owner UID via public.admin_users and public.is_admin()

-- 1. Create admin_users table to store verified owner/admin UID
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'owner' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 2. Create is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if authenticated user's UID exists in admin_users
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Replace all write policies to strictly require is_admin()
-- categories
DROP POLICY IF EXISTS "Authenticated admin manage categories" ON public.categories;
CREATE POLICY "Owner only manage categories" ON public.categories 
FOR ALL TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- products
DROP POLICY IF EXISTS "Authenticated admin manage products" ON public.products;
CREATE POLICY "Owner only manage products" ON public.products 
FOR ALL TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- product_variants
DROP POLICY IF EXISTS "Authenticated admin manage product_variants" ON public.product_variants;
CREATE POLICY "Owner only manage product_variants" ON public.product_variants 
FOR ALL TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- variant_price_tiers
DROP POLICY IF EXISTS "Authenticated admin manage variant_price_tiers" ON public.variant_price_tiers;
CREATE POLICY "Owner only manage variant_price_tiers" ON public.variant_price_tiers 
FOR ALL TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- product_addons
DROP POLICY IF EXISTS "Authenticated admin manage product_addons" ON public.product_addons;
CREATE POLICY "Owner only manage product_addons" ON public.product_addons 
FOR ALL TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- product_images
DROP POLICY IF EXISTS "Authenticated admin manage product_images" ON public.product_images;
CREATE POLICY "Owner only manage product_images" ON public.product_images 
FOR ALL TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- business_info
DROP POLICY IF EXISTS "Authenticated admin manage business_info" ON public.business_info;
CREATE POLICY "Owner only manage business_info" ON public.business_info 
FOR ALL TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- admin_users policy: only owner can view admin list
DROP POLICY IF EXISTS "Owner view admin_users" ON public.admin_users;
CREATE POLICY "Owner view admin_users" ON public.admin_users
FOR SELECT TO authenticated
USING (public.is_admin());

-- 4. Auto-register first created auth user as owner (bootstrap)
CREATE OR REPLACE FUNCTION public.handle_first_user_as_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM public.admin_users) = 0 THEN
        INSERT INTO public.admin_users (id, email, role)
        VALUES (NEW.id, NEW.email, 'owner');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_first_user_as_owner();
