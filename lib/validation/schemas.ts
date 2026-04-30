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

export type IdeaCreateInput = z.infer<typeof ideaCreateSchema>;
export type TodoCreateInput = z.infer<typeof todoCreateSchema>;
