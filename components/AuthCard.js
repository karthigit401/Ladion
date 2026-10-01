import Link from "next/link";
import { Card } from "@/components/ui";

export function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[radial-gradient(circle_at_top_right,rgba(124,160,179,0.08),transparent_45%)]">
      <div className="w-full max-w-md">
        <Link href="/services" className="flex items-baseline gap-2 justify-center mb-8">
          <span className="font-bold tracking-wide text-[17px]">LADION</span>
          <span className="font-mono-ladion text-[10px] tracking-widest text-muted">
            SERVICES PLATFORM
          </span>
        </Link>
        <Card className="p-8">
          <h1 className="text-xl font-semibold mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-muted mb-6">{subtitle}</p>}
          {children}
        </Card>
        {footer && <div className="text-center mt-5 text-sm text-muted">{footer}</div>}
      </div>
    </div>
  );
}
