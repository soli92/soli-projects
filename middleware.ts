import { NextRequest, NextResponse } from "next/server";

import { createSession, SESSION_COOKIE_NAME, verifySession } from "@/lib/auth/session";

const PUBLIC_PATHS = ["/login", "/api/auth"];
const PUBLIC_PREFIXES = ["/_next", "/favicon", "/manifest"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return true;
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const cookieValue = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const result = await verifySession(cookieValue);

  if (!result.valid) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (result.shouldRefresh) {
    const fresh = await createSession();
    const res = NextResponse.next();
    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: fresh.value,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: fresh.maxAge,
      path: "/",
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
