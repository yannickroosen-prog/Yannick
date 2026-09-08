import { defineConfig, devices } from "@playwright/test";

/**
 * E2E-tests draaien tegen een échte app + Supabase-project (geen mocks).
 * Vereist: app draait op E2E_BASE_URL, met NEXT_PUBLIC_SUPABASE_* ingesteld, en (voor de admin-tests)
 * E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD van een bestaand admin-account.
 * Zie docs/DEPLOYMENT.md §Testen.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    locale: "nl-BE",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
