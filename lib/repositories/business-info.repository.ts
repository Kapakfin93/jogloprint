import { createClient, requireAdminMutationClient } from "@/lib/supabase/server";
import { BusinessInfo } from "@/lib/types/database";

export async function getBusinessInfo(): Promise<BusinessInfo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_info")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching business_info:", error);
    return null;
  }

  return data as BusinessInfo;
}

export async function updateBusinessInfo(
  id: string,
  updates: Partial<Omit<BusinessInfo, "id" | "created_at" | "updated_at">>
): Promise<BusinessInfo> {
  const supabase = await requireAdminMutationClient();
  const { data, error } = await supabase
    .from("business_info")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update business info: ${error.message}`);
  }

  return data as BusinessInfo;
}
