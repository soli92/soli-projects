/**
 * Data access layer per pm_projects.
 * Solo server-side (usa getSupabaseAdmin).
 */

import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { PmProject } from "@/lib/supabase/types";

export async function listProjects(): Promise<PmProject[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pm_projects")
    .select("*")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) throw new Error(`listProjects failed: ${error.message}`);
  return data ?? [];
}

export async function getProjectBySlug(slug: string): Promise<PmProject | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pm_projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`getProjectBySlug failed: ${error.message}`);
  return data;
}
