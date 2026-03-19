import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
