import type { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-card backdrop-blur sm:p-6">
      <div className="mb-5">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-ink/70">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-line/60 bg-paper/85 p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-moss">{label}</p>
      <p className="mt-3 font-display text-4xl text-ink">{value}</p>
      {hint ? <p className="mt-2 text-sm text-ink/70">{hint}</p> : null}
    </div>
  );
}
