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
    <section className="parchment-card rounded-xl p-5 sm:p-6">
      <div className="mb-5 border-b border-line/35 pb-4">
        <h2 className="font-display text-3xl text-ink">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-ink/72">{description}</p> : null}
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
    <div className="parchment-card rounded-xl p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-moss">{label}</p>
      <p className="mt-3 font-display text-5xl leading-none text-primary">{value}</p>
      {hint ? <p className="mt-3 text-sm leading-6 text-ink/70">{hint}</p> : null}
    </div>
  );
}
