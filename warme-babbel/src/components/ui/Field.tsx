import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

type FieldProps = {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children?: ReactNode;
  className?: string;
};

/** Label + invoer + hint + foutmelding, met correcte aria-koppelingen. */
export function Field({ label, name, hint, error, required, children, className }: FieldProps) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errId = error ? `${name}-error` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={name} className="block text-sm font-semibold text-brand-ink">
        {label}
        {required && <span aria-hidden="true" className="text-brand-red"> *</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-brand-ink-muted">
          {hint}
        </p>
      )}
      <div data-described={[hintId, errId].filter(Boolean).join(" ") || undefined}>{children}</div>
      {error && (
        <p id={errId} role="alert" className="text-sm font-medium text-brand-red">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, invalid, ...props }: ComponentProps<"input"> & { invalid?: boolean }) {
  return <input className={cn("field-input", invalid && "border-brand-red", className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Textarea({ className, invalid, ...props }: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return <textarea className={cn("field-input min-h-32 resize-y", invalid && "border-brand-red", className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Select({ className, invalid, ...props }: ComponentProps<"select"> & { invalid?: boolean }) {
  return <select className={cn("field-input", invalid && "border-brand-red", className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Checkbox({ label, description, className, ...props }: ComponentProps<"input"> & { label: string; description?: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border border-transparent p-2 hover:bg-white/60", className)}>
      <input type="checkbox" className="form-checkbox mt-1 h-5 w-5 rounded border-brand-sand text-brand-orange focus:ring-brand-orange" {...props} />
      <span>
        <span className="block font-medium text-brand-ink">{label}</span>
        {description && <span className="block text-sm text-brand-ink-muted">{description}</span>}
      </span>
    </label>
  );
}
