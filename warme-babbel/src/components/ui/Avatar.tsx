/* eslint-disable @next/next/no-img-element */
import { cn, initials } from "@/lib/utils";

const sizes = { xs: "h-8 w-8 text-xs", sm: "h-10 w-10 text-sm", md: "h-14 w-14 text-base", lg: "h-24 w-24 text-2xl", xl: "h-32 w-32 text-3xl" };

/** Profielfoto (signed URL) of initialen op een warme achtergrond. */
export function Avatar({ src, name, size = "md", className }: { src?: string | null; name: string; size?: keyof typeof sizes; className?: string }) {
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-orange-soft font-heading font-bold text-brand-orange-dark ring-2 ring-white", sizes[size], className)}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span aria-hidden="true">{initials(name) || "•"}</span>}
      <span className="sr-only">{name}</span>
    </span>
  );
}
