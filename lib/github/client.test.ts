import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchTextFile, GitHubFetchError } from "./client";

describe("fetchTextFile", () => {
  beforeEach(() => {
    vi.stubEnv("GITHUB_TOKEN", "fake-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns null on 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 404,
        ok: false,
        statusText: "Not Found",
      })
    );

    await expect(
      fetchTextFile({
        owner: "soli92",
        repo: "soli-projects",
        path: "README.md",
      })
    ).resolves.toBeNull();
  });

  it("returns body text on 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        text: vi.fn().mockResolvedValue("# hello"),
      })
    );

    await expect(
      fetchTextFile({
        owner: "soli92",
        repo: "soli-projects",
        path: "README.md",
      })
    ).resolves.toBe("# hello");
  });

  it("throws GitHubFetchError on non-404 errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 500,
        ok: false,
        statusText: "Internal Server Error",
      })
    );

    await expect(
      fetchTextFile({
        owner: "soli92",
        repo: "soli-projects",
        path: "README.md",
      })
    ).rejects.toBeInstanceOf(GitHubFetchError);
  });
});
