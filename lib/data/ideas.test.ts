import { beforeEach, describe, expect, it, vi } from "vitest";

import { createIdea, listIdeasByProject } from "./ideas";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: vi.fn(),
}));

import { getSupabaseAdmin } from "@/lib/supabase/server";

describe("ideas data layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createIdea returns inserted data", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "idea-1", title: "Idea 1" },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });
    vi.mocked(getSupabaseAdmin).mockReturnValue({ from } as never);

    await expect(
      createIdea({
        project_id: "66f308a5-3ef3-4313-8bac-20d046bdea10",
        title: "Idea 1",
      })
    ).resolves.toMatchObject({ id: "idea-1" });
  });

  it("listIdeasByProject excludes discarded status", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: "idea-1", status: "draft" }],
      error: null,
    });
    const neq = vi.fn().mockReturnValue({ order });
    const eq = vi.fn().mockReturnValue({ neq });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    vi.mocked(getSupabaseAdmin).mockReturnValue({ from } as never);

    const result = await listIdeasByProject("proj-1");
    expect(result).toEqual([{ id: "idea-1", status: "draft" }]);
    expect(neq).toHaveBeenCalledWith("status", "discarded");
  });
});
