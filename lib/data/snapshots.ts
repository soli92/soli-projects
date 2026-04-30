/**
 * Helper per fetch live dei markdown da GitHub.
 * NON salva in pm_snapshots in Fase 1.B (snapshot caching arriva in Fase 3).
 * Restituisce solo content + parsed sections.
 */

import { fetchTextFile } from "@/lib/github/client";
import { extractKnownSections, parseMarkdownSections } from "@/lib/markdown/parser";
import type { PmProject, SnapshotSourceType } from "@/lib/supabase/types";

export interface ProjectSnapshot {
  sourceType: SnapshotSourceType;
  available: boolean;
  raw?: string;
  sections?: Record<string, string>;
  knownSections?: ReturnType<typeof extractKnownSections>;
}

const PATH_BY_SOURCE: Record<SnapshotSourceType, string> = {
  ai_log: "AI_LOG.md",
  agents_md: "AGENTS.md",
  weekly_log: "WEEKLY_LOG.md",
  readme: "README.md",
};

export async function fetchProjectSnapshot(
  project: PmProject,
  sourceType: SnapshotSourceType
): Promise<ProjectSnapshot> {
  const path = PATH_BY_SOURCE[sourceType];
  const content = await fetchTextFile({
    owner: project.github_owner,
    repo: project.github_repo,
    branch: project.github_branch,
    path,
  });

  if (content === null) {
    return { sourceType, available: false };
  }

  const sections = parseMarkdownSections(content);
  const knownSections = extractKnownSections(sections);
  return { sourceType, available: true, raw: content, sections, knownSections };
}

export async function fetchAllSnapshots(project: PmProject): Promise<ProjectSnapshot[]> {
  const types: SnapshotSourceType[] = ["ai_log", "agents_md", "weekly_log", "readme"];
  const results = await Promise.allSettled(types.map((t) => fetchProjectSnapshot(project, t)));
  return results.map((r, i) =>
    r.status === "fulfilled" ? r.value : { sourceType: types[i], available: false }
  );
}
