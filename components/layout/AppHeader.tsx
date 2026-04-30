import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-base font-semibold text-foreground">
          Soli Projects
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
            <Link href="/" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <a href="#" className="transition-colors hover:text-foreground">
              Chat
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Settings
            </a>
          </nav>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
              Esci
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
