"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Minimal navbar for trip page: back to dashboard + user email only. Not sticky. */
export function TripNavbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="w-full border-b border-border/80 bg-background/97 backdrop-blur-md shadow-soft">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <a href="/dashboard" className="flex shrink-0 items-center gap-3 hover:opacity-90 transition-smooth rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-2 py-2">
          <ArrowLeft className="size-4 text-muted-foreground" />
          <Image src="/Logo.png" alt="Tripli" width={72} height={20} className="h-5 w-auto" style={{ width: "auto", height: "auto" }} />
        </a>
        {!loading && user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card hover:bg-muted/80 hover:border-primary/20 transition-smooth focus:ring-2 focus:ring-ring/30 focus:ring-offset-2 outline-none shadow-soft">
              <UserIcon className="size-5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <a href="/dashboard" className="block w-full cursor-pointer">Dashboard</a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
