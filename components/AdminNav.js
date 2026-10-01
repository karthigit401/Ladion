"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";

export function AdminNav({ profile, demoMode }) {
  const pathname = usePathname();
  const router = useRouter();
  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/clients", label: "Clients" },
    { href: "/admin/payments", label: "Payments" },
    { href: "/admin/notifications", label: "Notifications" },
    ...(demoMode ? [{ href: "/admin/demo", label: "Demo control" }] : []),
  ];

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0d12]/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/admin/dashboard" className="flex items-baseline gap-2 shrink-0">
          <span className="font-bold tracking-wide text-[17px]">LADION</span>
          <span className="font-mono-ladion text-[10px] tracking-widest text-accent">ADMIN</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href} href={l.href}
              className={clsx("whitespace-nowrap transition-colors", pathname.startsWith(l.href) ? "text-fg" : "text-muted hover:text-fg")}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden lg:block text-sm text-muted">{profile.email}</span>
          <button onClick={signOut} className="text-sm text-muted hover:text-fg">Sign out</button>
        </div>
      </div>
    </header>
  );
}
