"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, User as UserIcon } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinkClass =
  "text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth py-2 px-2 sm:py-2.5 sm:px-3 rounded-lg hover:bg-muted/50";

/** Scrolled state: slim links — fixed row height, vertically centered */
const dockLinkClass =
  "inline-flex h-9 max-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md px-2.5 text-[13px] font-medium leading-none tracking-tight text-muted-foreground transition-colors hover:bg-primary/[0.07] hover:text-foreground sm:h-9 sm:px-3 sm:text-sm";

const navMorphEase = "cubic-bezier(0.22, 1, 0.36, 1)";
const navMorphDuration = "520ms";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [island, setIsland] = useState(false);
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

  useEffect(() => {
    /** Island after a small scroll; hysteresis avoids flicker at boundary */
    function onScroll() {
      const y = window.scrollY;
      setIsland((prev) => {
        if (prev) return y > 4;
        return y > 20;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const navItemsFull = (
    <>
      {!user && (
        <>
          <Link href="/#features" className={navLinkClass}>
            Features
          </Link>
          <Link href="/#how-it-works" className={navLinkClass}>
            How it works
          </Link>
          <Link href="/pricing" className={navLinkClass}>
            Pricing
          </Link>
          <Link href="/#faq" className={navLinkClass}>
            FAQ
          </Link>
        </>
      )}
      {!loading && user && (
        <a href="/dashboard" className={navLinkClass}>
          Dashboard
        </a>
      )}
    </>
  );

  const navItemsDock = (
    <>
      {!user && (
        <>
          <Link href="/#features" className={dockLinkClass}>
            Features
          </Link>
          <Link href="/#how-it-works" className={dockLinkClass}>
            How it works
          </Link>
          <Link href="/pricing" className={dockLinkClass}>
            Pricing
          </Link>
          <Link href="/#faq" className={dockLinkClass}>
            FAQ
          </Link>
        </>
      )}
      {!loading && user && (
        <a href="/dashboard" className={dockLinkClass}>
          Dashboard
        </a>
      )}
    </>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full will-change-[padding,background-color]",
        island
          ? "border-b-0 bg-transparent px-4 pt-3 pb-2 sm:px-6 sm:pt-4 sm:pb-3"
          : "border-b border-border/80 bg-background/97 backdrop-blur-md shadow-soft"
      )}
      style={{
        transitionProperty: "padding-top, padding-bottom, padding-left, padding-right, background-color, border-color, box-shadow, backdrop-filter",
        transitionDuration: navMorphDuration,
        transitionTimingFunction: navMorphEase,
      }}
    >
      <div className="flex w-full justify-center px-0 sm:px-0">
        {/* Single bar: width + radius morph from full strip → centered island (both sides pinch in) */}
        <div
          className={cn(
            "mx-auto w-full min-w-0 origin-center transition-[max-width,min-height,height,border-radius,box-shadow,border-color,gap,padding] will-change-[max-width,border-radius]",
            island
              ? "flex min-h-12 max-w-[min(100%-1.25rem,58rem)] flex-nowrap items-center justify-between gap-2 rounded-2xl border border-primary/18 bg-background/88 px-3 py-0 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(5,150,105,0.08)] backdrop-blur-2xl sm:max-w-[min(100%-1.5rem,64rem)] sm:gap-3 sm:px-4 md:grid md:min-h-12 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:justify-items-stretch md:px-5 dark:border-primary/22 dark:bg-background/75 dark:shadow-[0_4px_28px_-4px_rgba(0,0,0,0.35),0_0_0_1px_rgba(5,150,105,0.12)]"
              : "grid h-[4.5rem] max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-none border-0 bg-transparent px-4 py-0 shadow-none backdrop-blur-0 sm:gap-6 sm:px-6"
          )}
          style={{
            transitionDuration: navMorphDuration,
            transitionTimingFunction: navMorphEase,
          }}
        >
          <Link
            href="/"
            className={cn(
              "flex shrink-0 items-center self-center rounded-lg hover:opacity-90 transition-smooth outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 md:justify-self-start",
              island ? "py-0 md:py-0" : "justify-self-start py-1"
            )}
          >
            <Image
              src="/Logo.png"
              alt="Tripli"
              width={100}
              height={28}
              className={cn(
                "w-auto object-contain object-left transition-[height] duration-300",
                island ? "h-[1.25rem] sm:h-5" : "h-6 sm:h-7"
              )}
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </Link>

          <nav
            className={cn(
              "min-h-0 min-w-0 items-center",
              island
                ? "hidden md:flex md:justify-center md:gap-0.5 md:overflow-x-auto md:overflow-y-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                : "flex flex-wrap justify-center gap-0 sm:flex-nowrap sm:gap-0.5"
            )}
            aria-label="Main"
          >
            {island ? navItemsDock : navItemsFull}
          </nav>

          <div
            className={cn(
              "flex shrink-0 items-center justify-end gap-1 self-center sm:gap-2 md:justify-self-end",
              island && "min-w-0"
            )}
          >
            {!loading && (
              <>
                {island && !user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card/80 text-muted-foreground hover:bg-muted/60 hover:text-foreground md:hidden"
                      aria-label="Open menu"
                    >
                      <Menu className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem>
                        <Link href="/#features" className="block w-full">
                          Features
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/#how-it-works" className="block w-full">
                          How it works
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/#faq" className="block w-full">
                          FAQ
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/pricing" className="block w-full">
                          Pricing
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/login" className="block w-full">
                          Log in
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {!user ? (
                  <>
                    <Link
                      href="/login"
                      className={cn(
                        island ? cn(dockLinkClass, "hidden md:inline-flex") : navLinkClass
                      )}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className={cn(
                        "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold text-primary-foreground transition-smooth hover:opacity-95",
                        island
                          ? "h-9 rounded-lg bg-primary px-3 text-xs shadow-sm sm:px-4 sm:text-sm"
                          : "h-9 rounded-full bg-primary px-4 text-sm shadow-primary btn-primary-premium sm:h-10 sm:px-6"
                      )}
                    >
                      Get started
                    </Link>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-card outline-none transition-smooth hover:bg-muted/80 hover:border-primary/30 focus:ring-2 focus:ring-ring/30 focus:ring-offset-2 shadow-sm",
                        island
                          ? "h-9 w-9 rounded-lg border-border/80 bg-card/90 hover:border-primary/20 focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-9 sm:w-9"
                          : "h-9 w-9 sm:h-10 sm:w-10"
                      )}
                    >
                      <UserIcon
                        className={cn(
                          "text-muted-foreground",
                          island ? "size-4" : "size-4 sm:size-5"
                        )}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="font-normal">
                          <p className="truncate text-sm text-muted-foreground">
                            {user.email ?? "Account"}
                          </p>
                        </DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <a href="/dashboard" className="block w-full">
                          Dashboard
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/planner" className="block w-full">
                          New trip
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/dashboard/billing" className="block w-full">
                          Billing & plan
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-destructive focus:text-destructive"
                      >
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
