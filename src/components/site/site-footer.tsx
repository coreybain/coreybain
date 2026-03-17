import Link from "next/link";
import { getProfile } from "@/lib/site/public-data";

export async function SiteFooter() {
  const profile = await getProfile();

  return (
    <footer className="border-t border-[color:var(--color-border)] py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          {profile.name} / Building thoughtful software across web + Apple
          platforms.
        </p>
        <div className="flex items-center gap-4">
          {profile.socials.map((social) => (
            <Link
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm text-[color:var(--color-muted-foreground)] transition-colors hover:text-[color:var(--color-foreground)]"
            >
              {social.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
