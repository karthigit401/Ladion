import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import { AdminNav } from "@/components/AdminNav";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { isDemoMode } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/client/dashboard");
  const demo = isDemoMode();

  return (
    <div className="min-h-screen">
      <AdminNav profile={profile} demoMode={demo} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {demo && <div className="mb-6"><DemoModeBanner /></div>}
        {children}
      </main>
    </div>
  );
}
