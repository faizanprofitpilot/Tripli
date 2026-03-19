"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "This email is already registered. Try signing in." };
    }
    return { error: error.message };
  }

  let redirectTo = (formData.get("redirect") as string) || "/dashboard?welcome=1";
  if (!redirectTo.startsWith("/") || redirectTo.includes("//")) {
    redirectTo = "/dashboard?welcome=1";
  }
  redirect(redirectTo);
}

export async function signIn(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  let redirectTo = (formData.get("redirect") as string) || "/dashboard";
  if (!redirectTo.startsWith("/") || redirectTo.includes("//")) redirectTo = "/dashboard";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "Invalid email or password." };
    }
    return { error: error.message };
  }

  redirect(redirectTo);
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}
