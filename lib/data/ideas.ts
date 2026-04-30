import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { IdeaStatus, PmIdea } from "@/lib/supabase/types";

export interface CreateIdeaParams {
  project_id: string;
  title: string;
  body?: string;
  source?: "manual" | "agent" | "sync";
}

export async function createIdea(params: CreateIdeaParams): Promise<PmIdea> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pm_ideas")
    .insert({
      project_id: params.project_id,
      title: params.title,
      body: params.body || null,
      source: params.source ?? "manual",
      status: "draft",
    })
    .select()
    .single();

  if (error) throw new Error(`createIdea failed: ${error.message}`);
  return data;
}

export async function listIdeasByProject(projectId: string): Promise<PmIdea[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pm_ideas")
    .select("*")
    .eq("project_id", projectId)
    .neq("status", "discarded")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listIdeasByProject failed: ${error.message}`);
  return data ?? [];
}

export async function updateIdeaStatus(id: string, status: IdeaStatus): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("pm_ideas").update({ status }).eq("id", id);
  if (error) throw new Error(`updateIdeaStatus failed: ${error.message}`);
}

export async function discardIdea(id: string): Promise<void> {
  return updateIdeaStatus(id, "discarded");
}
