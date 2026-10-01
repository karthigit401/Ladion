import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { PublicNav } from "@/components/PublicNav";
import { Button, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({ params }) {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!service) notFound();

  const startHref = `/client/start-project?service=${service.slug}`;

  return (
    <div className="min-h-screen">
      <PublicNav profile={profile} />

      <div className="max-w-4xl mx-auto px-6 py-14">
        <Link href="/services" className="text-sm text-muted hover:text-fg">
          &larr; All services
        </Link>

        <div className="font-mono-ladion text-xs text-accent tracking-wide mt-6 mb-4">
          SERVICE
        </div>
        <h1 className="text-4xl font-semibold tracking-tight mb-4">{service.name}</h1>
        <p className="text-lg text-muted mb-10 max-w-2xl">{service.detailed_description}</p>

        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <Card className="p-6">
            <h3 className="font-mono-ladion text-xs text-muted mb-3">CAPABILITIES</h3>
            <ul className="space-y-2 text-sm">
              {(service.capabilities || []).map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="text-accent">&bull;</span>
                  {c}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-mono-ladion text-xs text-muted mb-3">TECHNOLOGY AREAS</h3>
            <div className="flex flex-wrap gap-2">
              {(service.technology_areas || []).map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">Ready to start?</h3>
            <p className="text-sm text-muted">
              Sign in and describe your project — the intake takes about five minutes.
            </p>
          </div>
          <Button as={Link} href={startHref} variant="solid" className="shrink-0">
            Start a project
          </Button>
        </Card>
      </div>
    </div>
  );
}
