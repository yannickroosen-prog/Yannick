import { Alert } from "@/components/ui/Alert";

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <Alert tone="error">{message}</Alert>;
}

export function SubmitHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-brand-ink-muted">{children}</p>;
}
