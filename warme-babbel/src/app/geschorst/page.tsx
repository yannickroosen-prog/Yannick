import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageShell, Card } from "@/components/ui/Card";
import { ORG } from "@/lib/site";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Account geschorst" };

export default async function SuspendedPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/inloggen");
  if (me.profile.account_status === "active") redirect("/profielen");
  return (
    <PageShell className="max-w-lg">
      <Card className="space-y-4">
        <h1 className="text-2xl">Je account is {me.profile.account_status === "suspended" ? "tijdelijk geschorst" : "geblokkeerd"}</h1>
        <p className="text-brand-ink-soft">
          Je kan voorlopig geen gesprekken voeren op Warme Babbel. Heb je vragen of denk je dat dit een vergissing is? Mail dan naar{" "}
          <a className="font-semibold text-brand-red underline" href={`mailto:${ORG.email}`}>{ORG.email}</a>.
        </p>
        <form action="/auth/uitloggen" method="post">
          <Button type="submit" variant="outline">Uitloggen</Button>
        </form>
      </Card>
    </PageShell>
  );
}
