import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNowStrict, isToday, isYesterday, isThisYear } from "date-fns";
import { nl } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return format(d, "HH:mm", { locale: nl });
  if (isYesterday(d)) return `gisteren ${format(d, "HH:mm", { locale: nl })}`;
  if (isThisYear(d)) return format(d, "d MMM HH:mm", { locale: nl });
  return format(d, "d MMM yyyy HH:mm", { locale: nl });
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: nl });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return format(new Date(iso), "d MMMM yyyy", { locale: nl });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return format(new Date(iso), "d MMM yyyy 'om' HH:mm", { locale: nl });
}

export function truncate(s: string | null | undefined, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Interne redirect-doelen valideren (open redirect vermijden). */
export function safeNext(next: string | null | undefined, fallback = "/profielen"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
