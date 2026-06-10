"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { clearSessionCookie, createSession, SESSION_COOKIE_NAME, verifyPassword } from "./session";

function sanitizeNext(next: FormDataEntryValue | null): string {
  if (typeof next !== "string") return "/";
  const trimmed = next.trim();
  // Deve essere un path interno: inizia con "/" ma non con "//" né con "/\".
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return "/";
  }
  // Rifiuta valori che (anche dopo decode) contengono "://" (es. URL assoluti smuggled).
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    return "/";
  }
  if (trimmed.includes("://") || decoded.includes("://")) {
    return "/";
  }
  // Ricontrolla il valore decodificato per protocol-relative / backslash injection.
  if (decoded.startsWith("//") || decoded.startsWith("/\\")) {
    return "/";
  }
  return trimmed;
}

export async function loginAction(formData: FormData) {
  const password = formData.get("password");
  const nextSafe = sanitizeNext(formData.get("next"));

  if (typeof password !== "string" || password.length === 0) {
    redirect(`/login?error=invalid&next=${encodeURIComponent(nextSafe)}`);
  }

  let valid = false;
  try {
    valid = await verifyPassword(password);
  } catch {
    redirect(`/login?error=config&next=${encodeURIComponent(nextSafe)}`);
  }

  if (!valid) {
    redirect(`/login?error=invalid&next=${encodeURIComponent(nextSafe)}`);
  }

  const session = await createSession();
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: session.value,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    maxAge: session.maxAge,
    path: "/",
  });

  redirect(nextSafe);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const cleared = clearSessionCookie();
  cookieStore.set({
    name: cleared.name,
    value: cleared.value,
    maxAge: cleared.maxAge,
    path: "/",
  });
  redirect("/login");
}
