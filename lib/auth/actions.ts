"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { clearSessionCookie, createSession, SESSION_COOKIE_NAME, verifyPassword } from "./session";

export async function loginAction(formData: FormData) {
  const password = formData.get("password");
  const next = formData.get("next");
  const nextSafe = typeof next === "string" && next.startsWith("/") ? next : "/";

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
    secure: process.env.NODE_ENV === "production",
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
