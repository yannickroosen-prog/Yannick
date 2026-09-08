import type { ReactNode } from "react";

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-brand-sand bg-white/60 px-6 py-12 text-center">
      {icon && <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange-soft text-brand-orange">{icon}</div>}
      <h3 className="text-lg font-bold">{title}</h3>
      {children && <div className="mx-auto mt-2 max-w-md text-brand-ink-soft">{children}</div>}
    </div>
  );
}
