import Link from "next/link";
import { Button } from "@/components/ui";

export function PublicNav({ profile }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0d12]/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/services" className="flex items-baseline gap-2">
          <span className="font-bold tracking-wide text-[17px]">LADION</span>
          <span className="font-mono-ladion text-[10px] tracking-widest text-muted">
            SERVICES PLATFORM
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
          <Link href="/services" className="hover:text-fg transition-colors">
            Services
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {profile ? (
            <Button as={Link} href={profile.role === "admin" ? "/admin/dashboard" : "/client/dashboard"}>
              {profile.role === "admin" ? "Admin Dashboard" : "My Dashboard"}
            </Button>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted hover:text-fg transition-colors">
                Sign in
              </Link>
              <Button as={Link} href="/register" variant="solid">
                Start a project
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
