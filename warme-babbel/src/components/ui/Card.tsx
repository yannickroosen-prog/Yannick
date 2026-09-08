import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-3xl bg-white p-6 shadow-card", className)} {...props} />;
}

export function PageShell({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("page-shell mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8", className)} {...props} />;
}

export function PageTitle({ title, intro, actions }: { title: string; intro?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {intro && <p className="mt-2 max-w-2xl text-lg text-brand-ink-soft">{intro}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
