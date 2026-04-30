import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTodo, cycleTodoStatus } from "./todos";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: vi.fn(),
}));

import { getSupabaseAdmin } from "@/lib/supabase/server";

describe("todos data layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createTodo returns inserted data", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "todo-1", title: "Todo 1", priority: "medium" },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });
    vi.mocked(getSupabaseAdmin).mockReturnValue({ from } as never);

    await expect(
      createTodo({
        project_id: "66f308a5-3ef3-4313-8bac-20d046bdea10",
        title: "Todo 1",
        priority: "medium",
      })
    ).resolves.toMatchObject({ id: "todo-1" });
  });

  it("cycleTodoStatus moves open to in_progress", async () => {
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq: updateEq });

    const single = vi.fn().mockResolvedValue({
      data: { status: "open" },
      error: null,
    });
    const selectEq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq: selectEq });

    const from = vi.fn().mockImplementation((table: string) => {
      if (table === "pm_todos") {
        return { select, update };
      }
      return {};
    });

    vi.mocked(getSupabaseAdmin).mockReturnValue({ from } as never);

    await expect(cycleTodoStatus("todo-1")).resolves.toBe("in_progress");
    expect(update).toHaveBeenCalledWith({
      status: "in_progress",
      completed_at: null,
    });
  });
});
