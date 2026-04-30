import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSupabaseAdmin, resetSupabaseAdmin } from "./server";

describe("getSupabaseAdmin", () => {
  beforeEach(() => {
    resetSupabaseAdmin();
    vi.unstubAllEnvs();
  });

  it("throws when SUPABASE_URL is missing", () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");

    expect(() => getSupabaseAdmin()).toThrowError("SUPABASE_URL non configurata");
  });

  it("throws when SUPABASE_SERVICE_ROLE_KEY is missing", () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    expect(() => getSupabaseAdmin()).toThrowError(
      "SUPABASE_SERVICE_ROLE_KEY non configurata"
    );
  });
});
