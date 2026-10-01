import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/server";
import { PublicNav } from "@/components/PublicNav";
import { Card, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-screen">
      <PublicNav profile={profile} />

      <div className="border-b border-white/5 bg-gradient-to-b from-accent/[0.06] to-transparent">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="font-mono-ladion text-xs text-accent tracking-wide mb-4">
            SYS / SERVICES
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-2xl mb-4">
            Engineering software, AI systems, and technology platforms.
          </h1>
          <p className="text-muted text-lg max-w-xl">
            Choose a service below to see what it covers, then start a project when you're ready.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        <SectionHeading eyebrow="Catalogue" title="What we do" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(services || []).map((service) => (
            <Link key={service.id} href={`/services/${service.slug}`}>
              <Card className="p-6 h-full hover:border-accent/40 transition-colors group">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-accentStrong transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-muted mb-4">{service.short_description}</p>
                <span className="text-sm text-accent">View service &rarr;</span>
              </Card>
            </Link>
          ))}
        </div>

        {(!services || services.length === 0) && (
          <p className="text-muted text-sm">
            No services published yet. Run <code className="font-mono-ladion">supabase/seed.sql</code> to
            load the catalogue.
          </p>
        )}
      </div>
    </div>
  );
}
