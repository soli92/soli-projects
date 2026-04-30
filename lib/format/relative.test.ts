import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatRelative } from "./relative";

describe("formatRelative", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-30T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns minutes ago", () => {
    expect(formatRelative("2026-04-30T11:50:00.000Z")).toBe("10 minuti fa");
  });

  it("returns hours ago", () => {
    expect(formatRelative("2026-04-30T09:00:00.000Z")).toBe("3 ore fa");
  });

  it("returns days ago", () => {
    expect(formatRelative("2026-04-28T12:00:00.000Z")).toBe("2 giorni fa");
  });

  it("returns ISO date beyond a week", () => {
    expect(formatRelative("2026-04-20T10:00:00.000Z")).toBe("2026-04-20");
  });
});
