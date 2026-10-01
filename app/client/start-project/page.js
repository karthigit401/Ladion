import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { StartProjectForm } from "@/components/StartProjectForm";

export const dynamic = "force-dynamic";

export default async function StartProjectPage({ searchParams }) {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const { data: services } = await supabase
    .from("services").select("slug, name, short_description")
    .eq("is_active", true).order("sort_order");

  return (
    <StartProjectForm
      services={services || []}
      initialService={searchParams?.service || ""}
      userId={profile.id}
      defaultCompany={profile.company || ""}
    />
  );
}
