import Link from "next/link";
import { cookies } from "next/headers";
import { logoutAction } from "@/lib/auth/actions";
import { MobileNav } from "@/components/layout/MobileNav";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth/session";

export async function AppHeader() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const { valid: isAuthenticated } = await verifySession(sessionCookie?.value);

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-base font-semibold text-foreground">
          Soli Projects
        </Link>
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
              <Link href="/" className="transition-colors hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/wiki" className="transition-colors hover:text-foreground">
                Wiki
              </Link>
              <Link href="/tasks" className="transition-colors hover:text-foreground">
                Task
              </Link>
            </nav>
            <form action={logoutAction} className="hidden sm:block">
              <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
                Esci
              </button>
            </form>
            <MobileNav logoutAction={logoutAction} />
          </div>
        )}
      </div>
    </header>
  );
}
