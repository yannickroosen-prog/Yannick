import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

export function Pagination({ page, totalPages, makeHref }: { page: number; totalPages: number; makeHref: (p: number) => string }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Paginering" className="mt-8 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link href={makeHref(page - 1)} className={buttonClasses("outline", "sm")} rel="prev">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Vorige
        </Link>
      ) : (
        <span className={buttonClasses("outline", "sm", "opacity-40")} aria-disabled="true">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Vorige
        </span>
      )}
      <span className="text-sm text-brand-ink-soft" aria-current="page">
        Pagina {page} van {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={makeHref(page + 1)} className={buttonClasses("outline", "sm")} rel="next">
          Volgende <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={buttonClasses("outline", "sm", "opacity-40")} aria-disabled="true">
          Volgende <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
