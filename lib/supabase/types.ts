/**
 * Tipi corrispondenti alle tabelle pm_*.
 * Fonte di verita': sql/001_init_pm_schema.sql.
 */

export type ProjectKind = "app" | "service" | "library";
export type ProjectStatus = "active" | "archived" | "paused";

export interface PmProject {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  kind: ProjectKind;
  status: ProjectStatus;
  github_owner: string;
  github_repo: string;
  github_branch: string;
  production_url: string | null;
  stack: string[];
  tags: string[];
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export type IdeaStatus = "draft" | "refined" | "converted" | "discarded";
export type IdeaSource = "manual" | "agent" | "sync";

export interface PmIdea {
  id: string;
  project_id: string;
  title: string;
  body: string | null;
  status: IdeaStatus;
  source: IdeaSource;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type TodoStatus = "open" | "in_progress" | "done" | "dropped";
export type TodoPriority = "low" | "medium" | "high" | "critical";
export type TodoSource = "manual" | "agent" | "sync" | "extracted";

export interface PmTodo {
  id: string;
  project_id: string;
  title: string;
  body: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  estimated_hours: number | null;
  due_date: string | null;
  source: TodoSource;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DebtSeverity = "low" | "medium" | "high" | "critical";
export type DebtStatus = "open" | "in_progress" | "resolved" | "wontfix";

export interface PmDebtItem {
  id: string;
  project_id: string;
  title: string;
  body: string | null;
  severity: DebtSeverity;
  status: DebtStatus;
  source_file: string | null;
  source_section: string | null;
  source_commit: string | null;
  auto_extracted: boolean;
  extracted_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SnapshotSourceType = "ai_log" | "agents_md" | "weekly_log" | "readme";

export interface PmSnapshot {
  id: string;
  project_id: string;
  source_type: SnapshotSourceType;
  raw_content: string;
  parsed_sections: Record<string, string>;
  fetched_at: string;
}
