type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <header className="space-y-3">
      {eyebrow ? (
        <p className="font-mono text-xs tracking-[0.14em] text-[color:var(--color-muted-foreground)] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-2xl font-semibold sm:text-3xl">{title}</h2>
      {description ? (
        <p className="max-w-3xl text-pretty text-[color:var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
