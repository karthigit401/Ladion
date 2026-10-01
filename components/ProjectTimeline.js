import { PROJECT_TIMELINE_STEPS } from "@/lib/demo";
import clsx from "clsx";

/**
 * Renders the ordered timeline (✓ / ● / ○) based on the project's current
 * status. "cancelled" is handled by the caller separately since it isn't
 * part of the normal forward progression.
 */
export function ProjectTimeline({ status }) {
  const order = PROJECT_TIMELINE_STEPS.map((s) => s.key);
  const currentIndex = order.indexOf(status);

  return (
    <ol className="space-y-2.5">
      {PROJECT_TIMELINE_STEPS.map((step, i) => {
        const state =
          currentIndex === -1
            ? "pending"
            : i < currentIndex
            ? "done"
            : i === currentIndex
            ? "current"
            : "pending";

        return (
          <li key={step.key} className="flex items-center gap-3 text-sm">
            <span
              className={clsx(
                "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-mono-ladion shrink-0",
                state === "done" && "bg-emerald-400/15 text-emerald-300 border border-emerald-400/30",
                state === "current" && "bg-accent/15 text-accentStrong border border-accent/40",
                state === "pending" && "bg-white/5 text-muted border border-white/10"
              )}
            >
              {state === "done" ? "\u2713" : state === "current" ? "\u25CF" : "\u25CB"}
            </span>
            <span className={clsx(state === "pending" ? "text-muted" : "text-fg")}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
