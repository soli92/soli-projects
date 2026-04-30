const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const REFRESH_THRESHOLD_SECONDS = 24 * 60 * 60;

export const SESSION_COOKIE_NAME = "soli_projects_session";
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

interface SessionPayload {
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SOLI_PROJECTS_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SOLI_PROJECTS_SESSION_SECRET non configurata (richiesta: 16+ char)");
  }
  return secret;
}

function getPassword(): string {
  const pwd = process.env.SOLI_PROJECTS_PASSWORD;
  if (!pwd || pwd.length === 0) {
    throw new Error("SOLI_PROJECTS_PASSWORD non configurata");
  }
  return pwd;
}

function bufferToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuffer(s: string): Uint8Array {
  const b64 = s
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(s.length + ((4 - (s.length % 4)) % 4), "=");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqualBuf(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

export async function verifyPassword(provided: string): Promise<boolean> {
  const expected = getPassword();
  const a = textEncoder.encode(provided);
  const b = textEncoder.encode(expected);
  return timingSafeEqualBuf(a, b);
}

async function signAsync(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));
  return bufferToBase64Url(new Uint8Array(sig));
}

export async function createSession(): Promise<{
  value: string;
  maxAge: number;
  expiresAt: Date;
}> {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const payloadStr = bufferToBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const sig = await signAsync(payloadStr, secret);
  return {
    value: `${payloadStr}.${sig}`,
    maxAge: SESSION_TTL_SECONDS,
    expiresAt: new Date(payload.exp * 1000),
  };
}

export interface VerifyResult {
  valid: boolean;
  payload?: SessionPayload;
  shouldRefresh?: boolean;
}

export async function verifySession(cookieValue: string | undefined): Promise<VerifyResult> {
  if (!cookieValue) return { valid: false };

  const parts = cookieValue.split(".");
  if (parts.length !== 2) return { valid: false };

  const [payloadStr, providedSig] = parts;
  if (!payloadStr || !providedSig) return { valid: false };

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { valid: false };
  }

  const expectedSig = await signAsync(payloadStr, secret);

  const a = base64UrlToBuffer(providedSig);
  const b = base64UrlToBuffer(expectedSig);
  if (!timingSafeEqualBuf(a, b)) return { valid: false };

  let payload: SessionPayload;
  try {
    const json = textDecoder.decode(base64UrlToBuffer(payloadStr));
    payload = JSON.parse(json) as SessionPayload;
  } catch {
    return { valid: false };
  }

  if (typeof payload.iat !== "number" || typeof payload.exp !== "number") {
    return { valid: false };
  }

  const now = Math.floor(Date.now() / 1000);
  if (now >= payload.exp) return { valid: false };

  const shouldRefresh = payload.exp - now <= REFRESH_THRESHOLD_SECONDS;
  return { valid: true, payload, shouldRefresh };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
  };
}
