import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSession, verifyPassword, verifySession } from "./session";

describe("session auth", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-30T00:00:00.000Z"));
    vi.stubEnv("SOLI_PROJECTS_SESSION_SECRET", "test-secret-32chars-minimum-aaaaa");
    vi.stubEnv("SOLI_PROJECTS_PASSWORD", "test-password");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("createSession + verifySession round-trip is valid", async () => {
    const session = await createSession();
    const result = await verifySession(session.value);
    expect(result.valid).toBe(true);
    expect(result.payload).toBeDefined();
    expect(result.shouldRefresh).toBe(false);
  });

  it("verifySession(undefined) returns invalid", async () => {
    await expect(verifySession(undefined)).resolves.toEqual({ valid: false });
  });

  it("verifySession with tampered payload is invalid", async () => {
    const session = await createSession();
    const [payload, signature] = session.value.split(".");
    const tampered = `${payload}x.${signature}`;
    await expect(verifySession(tampered)).resolves.toMatchObject({ valid: false });
  });

  it("verifySession with expired cookie is invalid", async () => {
    const session = await createSession();
    vi.setSystemTime(new Date("2026-05-08T00:00:01.000Z"));
    await expect(verifySession(session.value)).resolves.toMatchObject({ valid: false });
  });

  it("verifySession marks shouldRefresh in final day", async () => {
    const session = await createSession();
    vi.setSystemTime(new Date("2026-05-06T23:00:01.000Z"));
    const result = await verifySession(session.value);
    expect(result.valid).toBe(true);
    expect(result.shouldRefresh).toBe(true);
  });

  it("verifyPassword is true for valid password and false otherwise", async () => {
    await expect(verifyPassword("test-password")).resolves.toBe(true);
    await expect(verifyPassword("wrong-password")).resolves.toBe(false);
    await expect(verifyPassword("short")).resolves.toBe(false);
  });
});
