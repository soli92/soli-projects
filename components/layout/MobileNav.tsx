"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type NavLink = {
  href: string;
  label: string;
};

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Dashboard" },
  { href: "/wiki", label: "Wiki" },
  { href: "/tasks", label: "Task" },
];

type MobileNavProps = {
  /** Server action di logout passata da AppHeader (server component). */
  logoutAction: () => void | Promise<void>;
};

export function MobileNav({ logoutAction }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const panelId = "mobile-nav-panel";

  const close = useCallback(() => setOpen(false), []);

  // Chiusura con ESC + focus management.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        buttonRef.current?.focus();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    // Sposta il focus sul primo elemento focusabile del pannello.
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className="relative sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Chiudi menu di navigazione" : "Apri menu di navigazione"}
        aria-expanded={open}
        aria-controls={panelId}
        className="-mr-1 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-lg border border-border bg-background py-1 shadow-lg"
        >
          <nav className="flex flex-col" aria-label="Navigazione principale">
            {NAV_LINKS.map((link) => {
              const isCurrent =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={close}
                  className={`px-4 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground ${
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="my-1 border-t border-border" />
          <form action={logoutAction}>
            <button
              type="submit"
              onClick={close}
              className="w-full px-4 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Esci
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
