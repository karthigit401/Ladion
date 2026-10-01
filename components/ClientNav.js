"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/client/dashboard", label: "Overview" },
  { href: "/client/notifications", label: "Notifications" },
];

export function ClientNav({ profile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0d12]/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/client/dashboard" className="flex items-baseline gap-2">
          <span className="font-bold tracking-wide text-[17px]">LADION</span>
          <span className="font-mono-ladion text-[10px] tracking-widest text-muted">CLIENT</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "transition-colors",
                pathname === l.href ? "text-fg" : "text-muted hover:text-fg"
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/services" className="text-muted hover:text-fg transition-colors">
            Browse services
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-muted">{profile?.full_name || profile?.email}</span>
          <button onClick={handleSignOut} className="text-sm text-muted hover:text-fg">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
