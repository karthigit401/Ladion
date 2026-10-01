import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DemoControlPanel } from "@/components/DemoControlPanel";
import { isDemoMode } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function AdminDemoPage() {
  if (!isDemoMode()) notFound();
  const supabase = createClient();

  const { data: payments } = await supabase
    .from("payments").select("*, projects(name)")
    .in("status", ["created", "processing", "failed"]).order("created_at", { ascending: false });
  const { count } = await supabase
    .from("notifications").select("*", { count: "exact", head: true }).eq("status", "simulated");

  return (
    <div className="fade-up">
      <div className="font-mono-ladion text-xs text-accent tracking-wide mb-2">ADMIN / DEMO CONTROL</div>
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Demo control panel</h1>
      <DemoControlPanel payments={payments || []} simulatedCount={count || 0} />
    </div>
  );
}
