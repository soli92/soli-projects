import { z } from "zod";

export const ideaCreateSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(200),
  body: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const todoCreateSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(200),
  body: z.string().trim().max(5000).optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export const todoUpdateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "in_progress", "done", "dropped"]),
});

export const ideaUpdateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "refined", "converted", "discarded"]),
});

// Schema riusabile per un id record (UUID).
export const uuidSchema = z.string().uuid();

// Priorità ammesse per le direttive (allineate a TodoPriority).
export const directivePrioritySchema = z.enum(["low", "medium", "high", "critical"]);

// Id kanban: prefisso EP/US/TSK + numero (es. TSK-001). Vincola anche il path file.
export const kanbanIdSchema = z.string().regex(/^(EP|US|TSK)-\d+$/);

// Stati kanban ammessi (allineati a KanbanStatus in lib/kanban/reader.ts).
export const kanbanStatusSchema = z.enum([
  "draft",
  "ready",
  "in-progress",
  "done",
  "blocked",
  "dropped",
]);

export type IdeaCreateInput = z.infer<typeof ideaCreateSchema>;
export type TodoCreateInput = z.infer<typeof todoCreateSchema>;
