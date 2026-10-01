import clsx from "clsx";
import Link from "next/link";

export function Button({ as: As = "button", variant = "default", className, children, ...props }) {
  const styles = clsx(
    "btn",
    variant === "solid" && "btn-solid",
    variant === "ghost" && "btn-ghost",
    className
  );
  if (As === Link) {
    return (
      <Link className={styles} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <As className={styles} {...props}>
      {children}
    </As>
  );
}

export function Card({ className, children, ...props }) {
  return (
    <div className={clsx("card p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({ tone = "neutral", children }) {
  const tones = {
    neutral: "border-white/15 text-muted",
    accent: "border-accent/30 text-accentStrong bg-accent/10",
    success: "border-emerald-400/30 text-emerald-300 bg-emerald-400/10",
    warning: "border-amber-400/30 text-amber-300 bg-amber-400/10",
    danger: "border-rose-400/30 text-rose-300 bg-rose-400/10",
  };
  return <span className={clsx("badge", tones[tone] || tones.neutral)}>{children}</span>;
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-accent/25 bg-accent/[0.03] p-8 text-center">
      <p className="font-mono-ladion text-xs text-muted mb-2">{title}</p>
      {description && <p className="text-sm text-muted max-w-md mx-auto">{description}</p>}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-8 max-w-2xl">
      {eyebrow && (
        <div className="font-mono-ladion text-xs text-accent tracking-wide mb-3">{eyebrow}</div>
      )}
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">{title}</h2>
      {description && <p className="text-muted text-base">{description}</p>}
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <Card className="p-5">
      <div className="font-mono-ladion text-xs text-muted mb-2">{label}</div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted mt-1">{hint}</div>}
    </Card>
  );
}

export function Skeleton({ className }) {
  return <div className={clsx("animate-pulse rounded-md bg-white/[0.06]", className)} />;
}
