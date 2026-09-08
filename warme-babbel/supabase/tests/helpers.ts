import { Client, Pool, type PoolClient } from "pg";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const TEST_DB_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54329/warme_babbel_test";

const root = join(__dirname, "..", "..");

/** Zet een verse database op met shim + migraties (enkel lokaal). */
export async function resetDatabase() {
  if (!/127\.0\.0\.1|localhost/.test(TEST_DB_URL)) {
    throw new Error("RLS-tests draaien enkel tegen een lokale database (TEST_DATABASE_URL).");
  }
  const c = new Client({ connectionString: TEST_DB_URL });
  await c.connect();
  await c.query(`
    drop schema if exists public cascade; create schema public;
    drop schema if exists auth cascade;
    drop schema if exists storage cascade;
    drop publication if exists supabase_realtime;
    grant all on schema public to public;
  `);
  await c.query(readFileSync(join(root, "supabase/tests/local-shim.sql"), "utf8"));
  const dir = join(root, "supabase/migrations");
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".sql")).sort()) {
    await c.query(readFileSync(join(dir, f), "utf8"));
  }
  await c.end();
}

export const pool = new Pool({ connectionString: TEST_DB_URL, max: 4 });

export type Actor = { id: string; email: string } | "anon" | "service";

/**
 * Voert `fn` uit binnen een transactie als de opgegeven actor, exact zoals PostgREST dat doet:
 * `set local role` + `request.jwt.claims`. Alle wijzigingen worden gecommit (tenzij fout).
 */
export async function as<T>(actor: Actor, fn: (q: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    if (actor === "anon") {
      await client.query(`select set_config('request.jwt.claims', '{"role":"anon"}', true)`);
      await client.query("set local role anon");
    } else if (actor === "service") {
      await client.query(`select set_config('request.jwt.claims', '{"role":"service_role"}', true)`);
      await client.query("set local role service_role");
    } else {
      await client.query(`select set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify({ sub: actor.id, role: "authenticated", email: actor.email }),
      ]);
      await client.query("set local role authenticated");
    }
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/** Verwacht dat de actie faalt (RLS-weigering, trigger, constraint …). Geeft de foutboodschap terug. */
export async function expectDenied(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return (e as Error).message;
  }
  throw new Error("Verwachtte een weigering, maar de actie slaagde");
}

/** Maakt een auth-gebruiker aan (trigger maakt profiel) en geeft de actor terug. */
export async function createUser(email: string, displayName: string) {
  const c = await pool.connect();
  try {
    const r = await c.query(
      `insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id`,
      [email, JSON.stringify({ display_name: displayName, accepted_privacy: true })],
    );
    return { id: r.rows[0].id as string, email };
  } finally {
    c.release();
  }
}

/** Zet rol/status rechtstreeks als superuser (setup-hulp, geen RLS). */
export async function setRole(userId: string, role: "seeker" | "listener" | "admin", listing?: "pending" | "approved" | "rejected") {
  const c = await pool.connect();
  try {
    await c.query(`update public.profiles set role = $2, listing_status = coalesce($3, listing_status) where id = $1`, [
      userId,
      role,
      listing ?? null,
    ]);
  } finally {
    c.release();
  }
}
