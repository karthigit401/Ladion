import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PaymentGateway } from "@/components/PaymentGateway";
import { isDemoMode } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }) {
  const supabase = createClient();
  // RLS guarantees a client can only load their own payment.
  const { data: payment } = await supabase
    .from("payments").select("*, projects(id, name, project_code)").eq("id", params.paymentId).single();
  if (!payment) notFound();

  return <PaymentGateway payment={payment} demoMode={isDemoMode()} />;
}
