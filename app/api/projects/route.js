import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile, ok, fail } from "@/lib/api";
import { logProjectSubmitted } from "@/lib/projectEvents";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/demo";

const TEXT_FIELDS = [
  "company", "description", "business_problem", "goals", "functional_requirements",
  "technical_requirements", "target_users", "preferred_technology", "expected_features",
  "integrations_required", "budget",
];

function clean(v, max = 4000) {
  return typeof v === "string" ? v.trim().slice(0, max) : null;
}

export async function POST(request) {
  const profile = await getSessionProfile();
  if (!profile) return fail("Please sign in to submit a project.", 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body.");
  }

  const name = clean(body.name, 200);
  if (!name) return fail("Project name is required.");
  if (!body.serviceSlug) return fail("Please select a service.");

  const supabase = createClient();
  const admin = createAdminClient();

  const { data: service } = await supabase
    .from("services").select("id, name").eq("slug", body.serviceSlug).single();
  if (!service) return fail("Selected service was not found.");

  const { data: code, error: codeError } = await admin.rpc("generate_project_code");
  if (codeError) return fail("Could not generate a project ID.", 500);

  const row = {
    project_code: code,
    client_id: profile.id,
    service_id: service.id,
    name,
    priority: ["low", "normal", "high", "urgent"].includes(body.priority) ? body.priority : "normal",
    timeline_start: body.timeline_start || null,
    timeline_end: body.timeline_end || null,
  };
  TEXT_FIELDS.forEach((f) => (row[f] = clean(body[f]) || null));

  // Insert with the user's own session so RLS enforces client_id = auth.uid().
  const { data: project, error } = await supabase.from("projects").insert(row).select().single();
  if (error) return fail(error.message, 400);

  // Validate + record uploaded file metadata (files already in Storage under {userId}/...).
  const files = Array.isArray(body.files) ? body.files.slice(0, 10) : [];
  const fileRows = [];
  for (const f of files) {
    if (!f?.file_path?.startsWith(`${profile.id}/`)) continue;
    if (f.file_type && !ALLOWED_UPLOAD_TYPES.includes(f.file_type)) continue;
    if (f.file_size && f.file_size > MAX_UPLOAD_BYTES) continue;
    fileRows.push({
      project_id: project.id,
      uploaded_by: profile.id,
      file_name: clean(f.file_name, 255),
      file_path: f.file_path,
      file_type: f.file_type || null,
      file_size: f.file_size || null,
    });
  }
  if (fileRows.length) await supabase.from("project_files").insert(fileRows);

  await logProjectSubmitted(admin, { project, actorId: profile.id });

  return ok({ project: { ...project, service_name: service.name } }, 201);
}
