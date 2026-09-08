import { cn } from "@/lib/utils";
import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "error";
const tones: Record<Tone, { box: string; Icon: typeof Info }> = {
  info: { box: "bg-brand-beige text-brand-ink border-brand-sand", Icon: Info },
  success: { box: "bg-brand-sage-soft text-brand-sage border-brand-sage/30", Icon: CheckCircle2 },
  warning: { box: "bg-brand-orange-soft text-brand-orange-dark border-brand-orange/30", Icon: TriangleAlert },
  error: { box: "bg-red-50 text-brand-red border-brand-red/30", Icon: XCircle },
};

export function Alert({ tone = "info", title, children, className }: { tone?: Tone; title?: string; children?: ReactNode; className?: string }) {
  const { box, Icon } = tones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-2xl border px-4 py-3 text-sm", box, className)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
