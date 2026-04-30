import { describe, expect, it } from "vitest";

import { ideaCreateSchema, todoCreateSchema, todoUpdateStatusSchema } from "./schemas";

describe("validation schemas", () => {
  it("ideaCreateSchema validates valid payload", () => {
    const parsed = ideaCreateSchema.parse({
      project_id: "66f308a5-3ef3-4313-8bac-20d046bdea10",
      title: "Nuova idea",
      body: "Dettagli",
    });
    expect(parsed.title).toBe("Nuova idea");
  });

  it("ideaCreateSchema rejects empty and too long title", () => {
    expect(() =>
      ideaCreateSchema.parse({
        project_id: "66f308a5-3ef3-4313-8bac-20d046bdea10",
        title: " ",
      })
    ).toThrow();

    expect(() =>
      ideaCreateSchema.parse({
        project_id: "66f308a5-3ef3-4313-8bac-20d046bdea10",
        title: "a".repeat(201),
      })
    ).toThrow();
  });

  it("todoCreateSchema applies default priority and rejects invalid priority", () => {
    const parsed = todoCreateSchema.parse({
      project_id: "66f308a5-3ef3-4313-8bac-20d046bdea10",
      title: "Nuovo todo",
    });
    expect(parsed.priority).toBe("medium");

    expect(() =>
      todoCreateSchema.parse({
        project_id: "66f308a5-3ef3-4313-8bac-20d046bdea10",
        title: "Nuovo todo",
        priority: "urgent",
      })
    ).toThrow();
  });

  it("todoUpdateStatusSchema rejects invalid status", () => {
    expect(() =>
      todoUpdateStatusSchema.parse({
        id: "66f308a5-3ef3-4313-8bac-20d046bdea10",
        status: "paused",
      })
    ).toThrow();
  });
});
