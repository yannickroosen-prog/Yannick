import { requireUser } from "@/lib/auth";

/** Alle routes in deze groep vereisen een actieve, ingelogde gebruiker. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}
