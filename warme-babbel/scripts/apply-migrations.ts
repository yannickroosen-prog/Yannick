/**
 * Past de SQL-migraties toe op een PostgreSQL-database.
 *
 *   npx tsx scripts/apply-migrations.ts [--shim] [--reset]
 *
 * --shim  : laadt eerst supabase/tests/local-shim.sql (alleen voor een lokale, niet-Supabase Postgres)
 * --reset : dropt en hermaakt schema public/auth/storage vóór het toepassen (alleen lokaal!)
 *
 * Voor een echt Supabase-project gebruik je `supabase db push` of de SQL-editor; dit script is bedoeld
 * voor de lokale test-database (TEST_DATABASE_URL).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error("Zet TEST_DATABASE_URL (of DATABASE_URL).");
  process.exit(1);
}
const useShim = process.argv.includes("--shim");
const reset = process.argv.includes("--reset");

async function main() {
  const client = new Client({ connectionString: url });
  await client.connect();
  const root = join(__dirname, "..");

  if (reset) {
    if (!/127\.0\.0\.1|localhost/.test(url!)) {
      throw new Error("--reset is enkel toegelaten op een lokale database.");
    }
    await client.query(`
      drop schema if exists public cascade; create schema public;
      drop schema if exists auth cascade;
      drop schema if exists storage cascade;
      drop publication if exists supabase_realtime;
      grant all on schema public to public;
    `);
  }

  if (useShim) {
    await client.query(readFileSync(join(root, "supabase/tests/local-shim.sql"), "utf8"));
  }

  const dir = join(root, "supabase/migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  await client.query(`create table if not exists public._migrations (name text primary key, applied_at timestamptz default now())`);
  for (const f of files) {
    const done = await client.query(`select 1 from public._migrations where name = $1`, [f]);
    if (done.rowCount) {
      console.log(`↷ ${f} (al toegepast)`);
      continue;
    }
    process.stdout.write(`▶ ${f} … `);
    await client.query("begin");
    try {
      await client.query(readFileSync(join(dir, f), "utf8"));
      await client.query(`insert into public._migrations (name) values ($1)`, [f]);
      await client.query("commit");
      console.log("ok");
    } catch (e) {
      await client.query("rollback");
      console.log("FOUT");
      throw e;
    }
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
