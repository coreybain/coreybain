"use client";

import { FlaskConical, Menu, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Blog" },
  { href: "/ask", label: "Ask Corey" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)]/80 bg-[color:var(--color-surface)]/80 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.16em] text-[color:var(--color-muted-foreground)] uppercase"
        >
          coreybaines
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className={`inline-flex items-center text-sm transition-colors ${
                  isActive
                    ? "text-[color:var(--color-foreground)]"
                    : "text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
                }`}
              >
                {item.icon ? (
                  <span className="inline-flex items-center gap-2">
                    <item.icon className="mb-0.5 h-4 w-4" aria-hidden="true" />
                    <span className={isActive ? "" : "sr-only"}>{item.label}</span>
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-controls="mobile-site-nav"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] md:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-200 ease-out md:hidden ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav
          id="mobile-site-nav"
          aria-hidden={!isMobileMenuOpen}
          className={`border-t bg-[color:var(--color-surface)]/95 transition-transform duration-200 ease-out ${
            isMobileMenuOpen
              ? "translate-y-0 border-[color:var(--color-border)]/80"
              : "-translate-y-2 border-transparent"
          }`}
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-3 sm:px-8">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = isActivePath(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-2xl px-4 py-3 text-sm transition-colors ${
                        isActive
                          ? "bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]"
                          : "text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-surface-alt)] hover:text-[color:var(--color-foreground)]"
                      }`}
                    >
                      {item.icon ? (
                        <span className="inline-flex items-center gap-2">
                          <item.icon className="mb-0.5 h-4 w-4" aria-hidden="true" />
                          <span>{item.label}</span>
                        </span>
                      ) : (
                        item.label
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
