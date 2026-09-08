import { test, expect, type Browser } from "@playwright/test";
import { adminClient, createTestUser, deleteTestUser, login, type TestUser } from "./helpers";

/**
 * End-to-end scenario met vier actoren: bezoeker, babbelzoeker A, Warme Babbelaar L, beheerder.
 * Vereist een echt Supabase-project (zie playwright.config.ts).
 */
const admin = adminClient();
let seekerA: TestUser, seekerB: TestUser, listenerL: TestUser, adminUser: TestUser;

test.beforeAll(async () => {
  seekerA = await createTestUser(admin, "Ann");
  seekerB = await createTestUser(admin, "Bart");
  listenerL = await createTestUser(admin, "Leen", { role: "listener", approved: true });
  adminUser = await createTestUser(admin, "Beheerder", { role: "admin" });
});

test.afterAll(async () => {
  for (const u of [seekerA, seekerB, listenerL, adminUser]) if (u) await deleteTestUser(admin, u.id);
});

async function contextFor(browser: Browser, user: TestUser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await login(page, user);
  return { ctx, page };
}

test.describe("bezoeker (niet ingelogd)", () => {
  test("ziet de lijst met Warme Babbelaars maar kan niet chatten", async ({ page }) => {
    await page.goto("/profielen");
    await expect(page.getByRole("heading", { name: "Onze Warme Babbelaars" })).toBeVisible();
    await expect(page.getByText(listenerL.name, { exact: true }).first()).toBeVisible();
    await page.goto(`/profiel/${listenerL.id}`);
    await expect(page.getByRole("link", { name: /Log in om een bericht te sturen/ })).toBeVisible();
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/inloggen\?next=%2Fchat/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/inloggen/);
    // babbelzoekerprofielen zijn onzichtbaar
    const res = await page.goto(`/profiel/${seekerA.id}`);
    expect(res?.status()).toBe(404);
  });

  test("registratieformulier valideert", async ({ page }) => {
    await page.goto("/registreren");
    await page.getByLabel("Hoe mogen we je noemen?").fill("A");
    await page.getByLabel("E-mailadres").fill("geen-email");
    await page.getByLabel("Wachtwoord", { exact: true }).fill("kort");
    await page.getByLabel("Herhaal je wachtwoord").fill("anders");
    await page.getByRole("button", { name: "Account aanmaken" }).click();
    await expect(page.getByText(/minstens 2 tekens/)).toBeVisible();
    await expect(page.getByText(/geldig e-mailadres/)).toBeVisible();
    await expect(page.getByText(/minstens 10 tekens/)).toBeVisible();
  });
});

test.describe("babbelzoeker ↔ Warme Babbelaar", () => {
  let conversationId = "";

  test("A start een gesprek en L ontvangt het bericht realtime", async ({ browser }) => {
    const a = await contextFor(browser, seekerA);
    const l = await contextFor(browser, listenerL);

    await a.page.goto(`/profiel/${listenerL.id}`);
    await a.page.getByRole("button", { name: "Stuur een bericht" }).click();
    await a.page.waitForURL(/\/chat\/[0-9a-f-]{36}/);
    conversationId = a.page.url().split("/chat/")[1];

    await l.page.goto(`/chat/${conversationId}`);
    await expect(l.page.getByText("Nog geen berichten")).toBeVisible();

    const msg = `Hallo Leen, ik ben Ann ${Date.now()}`;
    await a.page.getByLabel("Je bericht").fill(msg);
    await a.page.getByRole("button", { name: "Verstuur bericht" }).click();
    await expect(a.page.getByText(msg)).toBeVisible();
    // realtime bij L, zonder herladen
    await expect(l.page.getByText(msg)).toBeVisible({ timeout: 15_000 });

    const reply = "Dag Ann, welkom. Zullen we bellen?";
    await l.page.getByLabel("Je bericht").fill(reply);
    await l.page.keyboard.press("Enter");
    await expect(a.page.getByText(reply)).toBeVisible({ timeout: 15_000 });

    // gesprekkenlijst met ongelezen-teller voor iemand die niet in het gesprek zit
    await a.page.goto("/chat");
    await expect(a.page.getByText(listenerL.name)).toBeVisible();
    await a.ctx.close();
    await l.ctx.close();
  });

  test("B kan het gesprek van A niet openen (404) en niet als lid schrijven", async ({ browser }) => {
    const b = await contextFor(browser, seekerB);
    const res = await b.page.goto(`/chat/${conversationId}`);
    expect(res?.status()).toBe(404);
    // Ook via de API (supabase-js) met B's sessie: RLS geeft niets terug
    const rows = await b.page.evaluate(async (convId) => {
      const { createBrowserClient } = await import("@supabase/ssr");
      const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { data } = await sb.from("messages").select("id").eq("conversation_id", convId);
      return data?.length ?? -1;
    }, conversationId).catch(() => 0);
    expect(rows).toBe(0);
    await b.ctx.close();
  });

  test("A blokkeert en rapporteert L; admin behandelt de melding", async ({ browser }) => {
    const a = await contextFor(browser, seekerA);
    await a.page.goto(`/chat/${conversationId}`);
    a.page.on("dialog", (d) => d.accept());
    await a.page.getByRole("button", { name: "Melden" }).click();
    await a.page.getByLabel("Wat is er aan de hand?").selectOption("spam");
    await a.page.getByLabel("Toelichting (optioneel)").fill("Test-melding e2e");
    await a.page.getByRole("button", { name: "Melding versturen" }).click();
    await expect(a.page.getByText(/Bedankt voor je melding/)).toBeVisible();

    await a.page.getByRole("button", { name: "Blokkeren" }).click();
    await expect(a.page.getByText(/Je hebt .* geblokkeerd/)).toBeVisible();
    await expect(a.page.getByLabel("Je bericht")).toHaveCount(0);
    await a.page.getByRole("button", { name: "Deblokkeren" }).click();
    await expect(a.page.getByLabel("Je bericht")).toBeVisible();
    await a.ctx.close();

    const adm = await contextFor(browser, adminUser);
    await adm.page.goto("/admin/rapporteringen");
    await adm.page.getByRole("link", { name: "Spam of reclame" }).first().click();
    await adm.page.getByLabel("Status").selectOption("afgehandeld");
    await adm.page.getByLabel("Interne notities").fill("Bekeken, geen actie nodig.");
    await adm.page.getByRole("button", { name: "Opslaan" }).click();
    await expect(adm.page.getByText("Melding bijgewerkt.")).toBeVisible();
    await adm.ctx.close();
  });

  test("gewone gebruiker kan admin niet openen", async ({ browser }) => {
    const a = await contextFor(browser, seekerA);
    await a.page.goto("/admin");
    await expect(a.page).toHaveURL(/\/profielen/);
    await a.page.goto("/admin/gebruikers");
    await expect(a.page).not.toHaveURL(/\/admin/);
    await a.ctx.close();
  });

  test("A past profiel aan en verwijdert daarna het account", async ({ browser }) => {
    const a = await contextFor(browser, seekerA);
    await a.page.goto("/mijn-profiel");
    await a.page.getByLabel("Naam").fill("Ann V.");
    await a.page.getByLabel("Mijn verhaal").fill("Mama van een tiener.");
    await a.page.getByRole("button", { name: "Profiel opslaan" }).click();
    await expect(a.page.getByText("Je profiel is opgeslagen.")).toBeVisible();

    await a.page.goto("/instellingen");
    a.page.on("dialog", (d) => d.accept());
    await a.page.getByLabel(/Typ "VERWIJDER"/).fill("VERWIJDER");
    await a.page.getByRole("button", { name: /definitief verwijderen/ }).click();
    await a.page.waitForURL(/account=verwijderd/);
    await a.ctx.close();

    // L ziet het gesprek nog, met "Verwijderde gebruiker"
    const l = await contextFor(browser, listenerL);
    await l.page.goto(`/chat/${conversationId}`);
    await expect(l.page.getByText("Verwijderde gebruiker").first()).toBeVisible();
    await l.ctx.close();
  });
});
