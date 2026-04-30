import { beforeEach, describe, expect, it, vi } from "vitest";

import { getProjectBySlug, listProjects } from "./projects";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: vi.fn(),
}));

import { getSupabaseAdmin } from "@/lib/supabase/server";

function createQueryMock(result: { data: unknown; error: { message: string } | null }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const order = vi.fn().mockResolvedValue(result);
  const eqSecond = vi.fn().mockReturnValue({ maybeSingle });
  const eqFirst = vi.fn().mockReturnValue({ order, eq: eqSecond, maybeSingle });
  const select = vi.fn().mockReturnValue({ eq: eqFirst });
  const from = vi.fn().mockReturnValue({ select });
  return { from };
}

describe("projects data layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listProjects returns data from supabase", async () => {
    const mockDb = createQueryMock({
      data: [{ id: "1", name: "Soli Projects" }],
      error: null,
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(mockDb as never);

    await expect(listProjects()).resolves.toEqual([{ id: "1", name: "Soli Projects" }]);
  });

  it("listProjects throws on supabase error", async () => {
    const mockDb = createQueryMock({
      data: null,
      error: { message: "boom" },
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(mockDb as never);

    await expect(listProjects()).rejects.toThrow("listProjects failed: boom");
  });

  it("getProjectBySlug returns null when not found", async () => {
    const mockDb = createQueryMock({
      data: null,
      error: null,
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(mockDb as never);

    await expect(getProjectBySlug("missing-project")).resolves.toBeNull();
  });
});
