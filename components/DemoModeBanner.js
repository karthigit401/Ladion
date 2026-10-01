export function DemoModeBanner() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-4 py-2.5 text-xs font-mono-ladion text-amber-200">
      <span className="font-semibold tracking-wide">DEMO MODE</span>
      <span className="text-amber-200/70">Payments: Simulated</span>
      <span className="text-amber-200/70">Email: Simulated</span>
      <span className="text-amber-200/70">WhatsApp: Simulated</span>
    </div>
  );
}
