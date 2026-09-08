import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const tones = {
  neutral: "bg-brand-beige text-brand-ink-soft",
  orange: "bg-brand-orange-soft text-brand-orange-dark",
  green: "bg-brand-sage-soft text-brand-sage",
  red: "bg-red-50 text-brand-red",
  ink: "bg-brand-ink text-white",
};

export function Badge({ tone = "neutral", children, className }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}
