import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
      {action}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{hint}</p>
    </article>
  );
}

type PlaceholderTableProps = {
  caption: string;
  headers: string[];
  rows: string[][];
};

export function PlaceholderTable({
  caption,
  headers,
  rows,
}: PlaceholderTableProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{caption}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              {headers.map((header) => (
                <th className="px-2 py-2 font-medium" key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                className="border-b border-slate-100 last:border-none dark:border-slate-800"
                key={`${row[0]}-${idx}`}
              >
                {row.map((cell) => (
                  <td className="px-2 py-3 text-slate-700 dark:text-slate-200" key={cell}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type NoteBlockProps = {
  title: string;
  body: string;
};

export function NoteBlock({ title, body }: NoteBlockProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-slate-100/80 px-4 py-3 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 opacity-90">{body}</p>
    </aside>
  );
}
