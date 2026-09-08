"use client";

import { useEffect, useRef } from "react";

/** Progressive enhancement: selects/checkboxes verzenden het GET-formulier automatisch. */
export function AutoSubmit() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const handler = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLSelectElement || (t instanceof HTMLInputElement && t.type === "checkbox")) form.requestSubmit();
    };
    form.addEventListener("change", handler);
    return () => form.removeEventListener("change", handler);
  }, []);
  return <span ref={ref} hidden />;
}
