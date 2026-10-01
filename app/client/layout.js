import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import { ClientNav } from "@/components/ClientNav";

export const dynamic = "force-dynamic";

export default async function ClientLayout({ children }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return (
    <div className="min-h-screen">
      <ClientNav profile={profile} />
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
