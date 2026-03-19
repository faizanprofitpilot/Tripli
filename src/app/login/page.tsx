import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen flex flex-col page-bg">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block hover:opacity-90 transition-smooth">
              <Image src="/Logo.png" alt="Tripli" width={100} height={28} className="h-7 w-auto" style={{ width: "auto", height: "auto" }} />
            </Link>
            <h1 className="mt-8 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-3 text-muted-foreground text-sm">
              Sign in to your account to access your trips.
            </p>
          </div>
          <div className="rounded-[var(--radius-card-lg)] border border-border bg-card p-6 shadow-card">
            <LoginForm redirectTo={params.redirect} />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={params.redirect ? `/signup?redirect=${encodeURIComponent(params.redirect)}` : "/signup"} className="font-semibold text-primary hover:opacity-90 transition-smooth">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
