import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

// Service Role client for trusted admin/server-only operations
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

/**
 * Enforces admin authentication before granting an elevated mutation client.
 * 1. Checks valid user session via session client (cookies).
 * 2. Verifies user exists in admin_users table with admin privileges.
 * 3. Throws UNAUTHORIZED / FORBIDDEN if verification fails.
 * 4. Only returns createAdminClient() upon confirmed admin identity.
 */
export async function requireAdminMutationClient() {
  const sessionClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await sessionClient.auth.getUser();

  if (authError || !user) {
    throw new Error("UNAUTHORIZED: Sesi admin tidak valid atau belum login.");
  }

  const { data: adminUser, error: roleError } = await sessionClient
    .from("admin_users")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (roleError || !adminUser) {
    throw new Error("FORBIDDEN: Akun Anda tidak memiliki hak akses administrator.");
  }

  return createAdminClient();
}

