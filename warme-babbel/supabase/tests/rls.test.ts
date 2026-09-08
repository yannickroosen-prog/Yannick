/**
 * RLS-/beveiligingstests voor de Warme Babbel-database.
 *
 * Elke test doet exact wat een (kwaadwillige) client via PostgREST zou kunnen doen:
 * queries als `anon`, `authenticated` (met een JWT-claim) of `service_role`.
 *
 * Vereist een lokale Postgres: `npm run db:local:start` en daarna `npm run test:rls`.
 */
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { as, createUser, expectDenied, pool, resetDatabase, setRole } from "./helpers";

type U = { id: string; email: string };
let seekerA: U, seekerB: U, listenerL: U, listenerPending: U, admin: U;

beforeAll(async () => {
  await resetDatabase();
  seekerA = await createUser("a@test.local", "Ann");
  seekerB = await createUser("b@test.local", "Bart");
  listenerL = await createUser("l@test.local", "Leen");
  listenerPending = await createUser("p@test.local", "Piet");
  admin = await createUser("admin@test.local", "Beheerder");
  await setRole(listenerL.id, "listener", "approved");
  await setRole(listenerPending.id, "listener", "pending");
  await setRole(admin.id, "admin");
});

afterAll(async () => {
  await pool.end();
});

describe("profielen", () => {
  it("trigger maakt profiel + voorkeuren bij registratie", async () => {
    const r = await as("service", (q) => q.query(`select display_name, role from public.profiles where id = $1`, [seekerA.id]));
    expect(r.rows[0]).toEqual({ display_name: "Ann", role: "seeker" });
    const p = await as("service", (q) => q.query(`select accepted_privacy_at from public.profile_preferences where user_id = $1`, [seekerA.id]));
    expect(p.rows[0].accepted_privacy_at).not.toBeNull();
  });

  it("anoniem ziet enkel goedgekeurde, zichtbare Warme Babbelaars", async () => {
    const r = await as("anon", (q) => q.query(`select id, display_name from public.profiles order by display_name`));
    expect(r.rows.map((x) => x.display_name)).toEqual(["Leen"]);
  });

  it("babbelzoeker ziet zichzelf en gelijste babbelaars, niet andere babbelzoekers of pending babbelaars", async () => {
    const r = await as(seekerA, (q) => q.query(`select display_name from public.profiles order by display_name`));
    expect(r.rows.map((x) => x.display_name)).toEqual(["Ann", "Leen"]);
  });

  it("babbelzoeker kan andermans profiel niet wijzigen (0 rijen)", async () => {
    const r = await as(seekerA, (q) => q.query(`update public.profiles set story = 'hack' where id = $1`, [listenerL.id]));
    expect(r.rowCount).toBe(0);
    const check = await as("service", (q) => q.query(`select story from public.profiles where id = $1`, [listenerL.id]));
    expect(check.rows[0].story).toBeNull();
  });

  it("gebruiker kan eigen profiel wijzigen, maar geen ongeldige opties", async () => {
    const r = await as(seekerA, (q) =>
      q.query(`update public.profiles set story = 'Mijn verhaal', regions = '{brussel}', themes = '{autisme}' where id = $1`, [seekerA.id]),
    );
    expect(r.rowCount).toBe(1);
    const msg = await expectDenied(
      as(seekerA, (q) => q.query(`update public.profiles set regions = '{mars}' where id = $1`, [seekerA.id])),
    );
    expect(msg).toMatch(/check constraint|valid_options/i);
  });

  it("gebruiker kan zichzelf geen admin maken of status wijzigen", async () => {
    const msg = await expectDenied(as(seekerA, (q) => q.query(`update public.profiles set role = 'admin' where id = $1`, [seekerA.id])));
    expect(msg).toMatch(/niet toegestaan/);
    const msg2 = await expectDenied(
      as(seekerA, (q) => q.query(`update public.profiles set listing_status = 'approved', role = 'listener' where id = $1`, [seekerA.id])),
    );
    expect(msg2).toMatch(/niet toegestaan/);
    const r = await as("service", (q) => q.query(`select role from public.profiles where id = $1`, [seekerA.id]));
    expect(r.rows[0].role).toBe("seeker");
  });

  it("gebruiker kan geen profiel aanmaken of verwijderen", async () => {
    await expectDenied(as(seekerA, (q) => q.query(`insert into public.profiles (id, display_name) values (gen_random_uuid(), 'Fake')`)));
    await expectDenied(as(seekerA, (q) => q.query(`delete from public.profiles where id = $1`, [listenerL.id])));
  });

  it("verborgen babbelaar verdwijnt uit de lijst, blijft zichtbaar voor zichzelf en admin", async () => {
    await as(listenerL, (q) => q.query(`update public.profiles set is_hidden = true where id = $1`, [listenerL.id]));
    const anon = await as("anon", (q) => q.query(`select id from public.profiles`));
    expect(anon.rowCount).toBe(0);
    const self = await as(listenerL, (q) => q.query(`select id from public.profiles where id = $1`, [listenerL.id]));
    expect(self.rowCount).toBe(1);
    const adm = await as(admin, (q) => q.query(`select count(*)::int as n from public.profiles`));
    expect(adm.rows[0].n).toBe(5);
    await as(listenerL, (q) => q.query(`update public.profiles set is_hidden = false where id = $1`, [listenerL.id]));
  });

  it("voorkeuren: enkel eigenaar", async () => {
    const own = await as(seekerA, (q) => q.query(`select * from public.profile_preferences`));
    expect(own.rows.map((r) => r.user_id)).toEqual([seekerA.id]);
    const r = await as(seekerA, (q) => q.query(`update public.profile_preferences set email_on_message = false where user_id = $1`, [listenerL.id]));
    expect(r.rowCount).toBe(0);
  });
});

describe("gesprekken en berichten", () => {
  let conv: string;

  it("babbelzoeker kan gesprek starten met gelijste babbelaar, niet met andere babbelzoeker of pending babbelaar", async () => {
    const r = await as(seekerA, (q) => q.query(`select public.start_conversation($1) as id`, [listenerL.id]));
    conv = r.rows[0].id;
    expect(conv).toBeTruthy();
    const again = await as(seekerA, (q) => q.query(`select public.start_conversation($1) as id`, [listenerL.id]));
    expect(again.rows[0].id).toBe(conv);
    expect(await expectDenied(as(seekerA, (q) => q.query(`select public.start_conversation($1)`, [seekerB.id])))).toMatch(/Warme Babbelaar|niet beschikbaar|niet/);
    expect(await expectDenied(as(seekerA, (q) => q.query(`select public.start_conversation($1)`, [listenerPending.id])))).toMatch(/Warme Babbelaar/);
    expect(await expectDenied(as(seekerA, (q) => q.query(`select public.start_conversation($1)`, [seekerA.id])))).toMatch(/Ongeldige/);
    await expectDenied(as("anon", (q) => q.query(`select public.start_conversation($1)`, [listenerL.id])));
  });

  it("gebruikers kunnen geen gesprekken rechtstreeks aanmaken", async () => {
    await expectDenied(
      as(seekerB, (q) =>
        q.query(`insert into public.conversations (user_low, user_high) values (least($1::uuid,$2::uuid), greatest($1::uuid,$2::uuid))`, [seekerB.id, listenerL.id]),
      ),
    );
    await expectDenied(as(seekerB, (q) => q.query(`insert into public.conversation_members (conversation_id, user_id) values ($1, $2)`, [conv, seekerB.id])));
  });

  it("leden kunnen berichten sturen; buitenstaanders niet (ook niet met andermans sender_id)", async () => {
    await as(seekerA, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'Hallo Leen')`, [conv, seekerA.id]));
    await as(listenerL, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'Dag Ann, welkom')`, [conv, listenerL.id]));
    await expectDenied(as(seekerB, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'x')`, [conv, seekerB.id])));
    await expectDenied(as(seekerB, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'spoof')`, [conv, seekerA.id])));
    await expectDenied(as(seekerA, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'spoof')`, [conv, listenerL.id])));
    await expectDenied(as("anon", (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'x')`, [conv, seekerA.id])));
  });

  it("buitenstaander (B) kan gesprek/berichten van A niet lezen, ook niet met bekend ID", async () => {
    const c = await as(seekerB, (q) => q.query(`select * from public.conversations where id = $1`, [conv]));
    expect(c.rowCount).toBe(0);
    const m = await as(seekerB, (q) => q.query(`select * from public.messages where conversation_id = $1`, [conv]));
    expect(m.rowCount).toBe(0);
    const cm = await as(seekerB, (q) => q.query(`select * from public.conversation_members where conversation_id = $1`, [conv]));
    expect(cm.rowCount).toBe(0);
    const v = await as(seekerB, (q) => q.query(`select * from public.my_conversations`));
    expect(v.rowCount).toBe(0);
    // anoniem heeft zelfs geen tabelrechten op messages
    await expectDenied(as("anon", (q) => q.query(`select * from public.messages`)));
  });

  it("leden zien berichten; unread counts kloppen; markeren als gelezen werkt", async () => {
    const m = await as(seekerA, (q) => q.query(`select body from public.messages where conversation_id = $1 order by id`, [conv]));
    expect(m.rows.map((r) => r.body)).toEqual(["Hallo Leen", "Dag Ann, welkom"]);
    const v = await as(seekerA, (q) => q.query(`select unread_count, other_display_name, last_message_preview from public.my_conversations`));
    expect(v.rows[0].unread_count).toBe(1);
    expect(v.rows[0].other_display_name).toBe("Leen");
    expect(v.rows[0].last_message_preview).toBe("Dag Ann, welkom");
    const total = await as(seekerA, (q) => q.query(`select public.total_unread() as n`));
    expect(total.rows[0].n).toBe(1);
    await as(seekerA, (q) => q.query(`select public.mark_conversation_read($1)`, [conv]));
    const after = await as(seekerA, (q) => q.query(`select public.unread_count($1) as n`, [conv]));
    expect(after.rows[0].n).toBe(0);
  });

  it("gesprekspartners zien elkaars profiel (voor chat-header)", async () => {
    const r = await as(listenerL, (q) => q.query(`select display_name from public.profiles where id = $1`, [seekerA.id]));
    expect(r.rows[0]?.display_name).toBe("Ann");
    const r2 = await as(listenerL, (q) => q.query(`select display_name from public.profiles where id = $1`, [seekerB.id]));
    expect(r2.rowCount).toBe(0);
  });

  it("niemand kan andermans bericht wijzigen of verwijderen; eigen bericht enkel soft-deleten", async () => {
    const other = await as(seekerA, (q) => q.query(`select id from public.messages where sender_id = $1`, [listenerL.id]));
    const otherId = other.rows[0].id;
    const upd = await as(seekerA, (q) => q.query(`update public.messages set body = 'gehackt' where id = $1`, [otherId]));
    expect(upd.rowCount).toBe(0);
    const del = await as(seekerA, (q) => q.query(`update public.messages set deleted_at = now() where id = $1`, [otherId]));
    expect(del.rowCount).toBe(0);
    await expectDenied(as(seekerA, (q) => q.query(`delete from public.messages where id = $1`, [otherId])));

    const own = await as(seekerA, (q) => q.query(`select id from public.messages where sender_id = $1`, [seekerA.id]));
    const ownId = own.rows[0].id;
    // inhoud herschrijven zonder deleted_at → geweigerd door with check
    await expectDenied(as(seekerA, (q) => q.query(`update public.messages set body = 'aangepast' where id = $1`, [ownId])));
    const soft = await as(seekerA, (q) => q.query(`update public.messages set deleted_at = now() where id = $1`, [ownId]));
    expect(soft.rowCount).toBe(1);
  });

  it("notificatie wordt aangemaakt voor de ontvanger en is enkel voor hem zichtbaar", async () => {
    await as(seekerA, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'Nog een vraag')`, [conv, seekerA.id]));
    const n = await as(listenerL, (q) => q.query(`select type, title, conversation_id from public.notifications where read_at is null`));
    expect(n.rows).toEqual([{ type: "new_message", title: "Nieuw bericht van Ann", conversation_id: conv }]);
    const nb = await as(seekerB, (q) => q.query(`select * from public.notifications`));
    expect(nb.rowCount).toBe(0);
    const spoof = await as(seekerB, (q) => q.query(`update public.notifications set read_at = now()`));
    expect(spoof.rowCount).toBe(0);
    // A kan geen notificaties injecteren
    await expectDenied(as(seekerA, (q) => q.query(`insert into public.notifications (user_id, type, title) values ($1, 'system', 'phish')`, [listenerL.id])));
  });

  it("archiveren geldt enkel voor jezelf", async () => {
    await as(seekerA, (q) => q.query(`select public.set_conversation_archived($1, true)`, [conv]));
    const a = await as(seekerA, (q) => q.query(`select is_archived from public.my_conversations`));
    expect(a.rows[0].is_archived).toBe(true);
    const l = await as(listenerL, (q) => q.query(`select is_archived from public.my_conversations`));
    expect(l.rows[0].is_archived).toBe(false);
    // nieuw bericht de-archiveert
    await as(listenerL, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'Ben je er nog?')`, [conv, listenerL.id]));
    const a2 = await as(seekerA, (q) => q.query(`select is_archived from public.my_conversations`));
    expect(a2.rows[0].is_archived).toBe(false);
  });

  it("rate limit: meer dan 30 berichten per minuut wordt geweigerd", async () => {
    const before = await as("service", (q) => q.query(`select count(*)::int as n from public.messages where sender_id = $1`, [seekerB.id]));
    expect(before.rows[0].n).toBe(0);
    const convB = (await as(seekerB, (q) => q.query(`select public.start_conversation($1) as id`, [listenerL.id]))).rows[0].id;
    let denied = "";
    for (let i = 0; i < 31; i++) {
      try {
        await as(seekerB, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, $3)`, [convB, seekerB.id, `bericht ${i}`]));
      } catch (e) {
        denied = (e as Error).message;
        break;
      }
    }
    expect(denied).toMatch(/Te veel berichten/);
    const count = await as("service", (q) => q.query(`select count(*)::int as n from public.messages where sender_id = $1`, [seekerB.id]));
    expect(count.rows[0].n).toBe(30);
  });
});

describe("blokkeren", () => {
  let conv: string;
  beforeAll(async () => {
    conv = (await as("service", (q) => q.query(`select id from public.conversations where user_low = least($1::uuid,$2::uuid) and user_high = greatest($1::uuid,$2::uuid)`, [seekerA.id, listenerL.id]))).rows[0].id;
  });

  it("geblokkeerde kan geen bericht meer sturen en ziet de blokkade niet", async () => {
    await as(listenerL, (q) => q.query(`insert into public.blocks (blocker_id, blocked_id) values ($1, $2)`, [listenerL.id, seekerA.id]));
    await expectDenied(as(seekerA, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'hallo?')`, [conv, seekerA.id])));
    // ook de blokkeerder kan niet meer sturen (symmetrisch)
    await expectDenied(as(listenerL, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'x')`, [conv, listenerL.id])));
    const visible = await as(seekerA, (q) => q.query(`select * from public.blocks`));
    expect(visible.rowCount).toBe(0);
    const flag = await as(seekerA, (q) => q.query(`select is_blocked from public.my_conversations where id = $1`, [conv]));
    expect(flag.rows[0].is_blocked).toBe(true);
  });

  it("geblokkeerde ziet de babbelaar niet meer in de lijst en kan geen nieuw gesprek starten", async () => {
    const list = await as(seekerA, (q) => q.query(`select display_name from public.profiles where id = $1`, [listenerL.id]));
    // wel nog zichtbaar via gedeeld gesprek (chat-header), maar niet via de publieke lijstpolicy alleen:
    const anonList = await as("anon", (q) => q.query(`select display_name from public.profiles`));
    expect(anonList.rows.map((r) => r.display_name)).toEqual(["Leen"]);
    expect(list.rowCount).toBe(1); // door gedeeld gesprek
    await expectDenied(as(seekerA, (q) => q.query(`select public.start_conversation($1)`, [listenerL.id])));
  });

  it("gebruiker kan enkel eigen blokkades aanmaken/verwijderen", async () => {
    await expectDenied(as(seekerB, (q) => q.query(`insert into public.blocks (blocker_id, blocked_id) values ($1, $2)`, [seekerA.id, seekerB.id])));
    const del = await as(seekerA, (q) => q.query(`delete from public.blocks where blocker_id = $1`, [listenerL.id]));
    expect(del.rowCount).toBe(0);
    const ok = await as(listenerL, (q) => q.query(`delete from public.blocks where blocker_id = $1 and blocked_id = $2`, [listenerL.id, seekerA.id]));
    expect(ok.rowCount).toBe(1);
    await as(seekerA, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'Terug in contact')`, [conv, seekerA.id]));
  });
});

describe("rapporteren en moderatie", () => {
  let reportId: string;
  let conv: string;
  beforeAll(async () => {
    conv = (await as("service", (q) => q.query(`select id from public.conversations where user_low = least($1::uuid,$2::uuid) and user_high = greatest($1::uuid,$2::uuid)`, [seekerA.id, listenerL.id]))).rows[0].id;
  });

  it("gebruiker kan profiel/gesprek/bericht melden binnen eigen bereik", async () => {
    const r = await as(seekerA, (q) =>
      q.query(`insert into public.reports (reporter_id, target_user_id, target_conversation_id, category, description) values ($1, $2, $3, 'intimidatie', 'test') returning id`, [seekerA.id, listenerL.id, conv]),
    );
    reportId = r.rows[0].id;
    // B kan het gesprek van A niet melden (geen lid) en niet in naam van A
    await expectDenied(as(seekerB, (q) => q.query(`insert into public.reports (reporter_id, target_conversation_id, category) values ($1, $2, 'spam')`, [seekerB.id, conv])));
    await expectDenied(as(seekerB, (q) => q.query(`insert into public.reports (reporter_id, target_user_id, category) values ($1, $2, 'spam')`, [seekerA.id, listenerL.id])));
    // zonder doelwit → constraint
    await expectDenied(as(seekerB, (q) => q.query(`insert into public.reports (reporter_id, category) values ($1, 'spam')`, [seekerB.id])));
  });

  it("melder ziet eigen melding; anderen niet; admin alles", async () => {
    expect((await as(seekerA, (q) => q.query(`select id from public.reports`))).rowCount).toBe(1);
    expect((await as(seekerB, (q) => q.query(`select id from public.reports`))).rowCount).toBe(0);
    expect((await as(listenerL, (q) => q.query(`select id from public.reports`))).rowCount).toBe(0);
    expect((await as(admin, (q) => q.query(`select id from public.reports`))).rowCount).toBe(1);
    // melder kan status niet zelf wijzigen
    await expectDenied(as(seekerA, (q) => q.query(`update public.reports set status = 'afgehandeld' where id = $1`, [reportId])));
  });

  it("admin kan gemeld gesprek inkijken, anderen niet", async () => {
    const m = await as(admin, (q) => q.query(`select body from public.messages where conversation_id = $1`, [conv]));
    expect(m.rowCount).toBeGreaterThan(0);
    const c = await as(admin, (q) => q.query(`select id from public.conversations where id = $1`, [conv]));
    expect(c.rowCount).toBe(1);
    const other = await as(seekerB, (q) => q.query(`select body from public.messages where conversation_id = $1`, [conv]));
    expect(other.rowCount).toBe(0);
  });

  it("enkel admin kan meldingen behandelen; melder krijgt notificatie", async () => {
    await expectDenied(as(seekerA, (q) => q.query(`select public.admin_update_report($1, 'afgehandeld', 'x')`, [reportId])));
    await expectDenied(as(listenerL, (q) => q.query(`select public.admin_update_report($1, 'afgehandeld', 'x')`, [reportId])));
    await as(admin, (q) => q.query(`select public.admin_update_report($1, 'in_behandeling', 'Bekeken')`, [reportId]));
    await as(admin, (q) => q.query(`select public.admin_update_report($1, 'afgehandeld', 'Gesprek gevoerd met vrijwilliger')`, [reportId]));
    const r = await as(admin, (q) => q.query(`select status, admin_notes, handled_by from public.reports where id = $1`, [reportId]));
    expect(r.rows[0]).toMatchObject({ status: "afgehandeld", admin_notes: "Gesprek gevoerd met vrijwilliger", handled_by: admin.id });
    const n = await as(seekerA, (q) => q.query(`select type from public.notifications where type = 'report_update'`));
    expect(n.rowCount).toBe(1);
    const log = await as(admin, (q) => q.query(`select action from public.moderation_events where report_id = $1 order by id`, [reportId]));
    expect(log.rows.map((x) => x.action)).toEqual(["report_status", "report_status"]);
    expect((await as(seekerA, (q) => q.query(`select * from public.moderation_events`))).rowCount).toBe(0);
  });
});

describe("admin", () => {
  it("niet-admins kunnen geen adminfuncties gebruiken", async () => {
    await expectDenied(as(seekerA, (q) => q.query(`select public.admin_set_role($1, 'admin')`, [seekerA.id])));
    await expectDenied(as(listenerL, (q) => q.query(`select public.admin_set_account_status($1, 'suspended')`, [seekerA.id])));
    await expectDenied(as(seekerA, (q) => q.query(`select public.admin_set_listing_status($1, 'approved')`, [seekerA.id])));
    await expectDenied(as(seekerA, (q) => q.query(`select public.admin_stats()`)));
    await expectDenied(as("anon", (q) => q.query(`select public.admin_stats()`)));
    await expectDenied(as(seekerA, (q) => q.query(`select public.admin_add_note($1, 'x')`, [seekerB.id])));
  });

  it("admin promoveert babbelzoeker tot babbelaar en keurt goed (met log + notificatie)", async () => {
    await as(admin, (q) => q.query(`select public.admin_set_role($1, 'listener', 'Na intake')`, [seekerB.id]));
    await as(admin, (q) => q.query(`select public.admin_set_listing_status($1, 'approved')`, [seekerB.id]));
    const anon = await as("anon", (q) => q.query(`select display_name from public.profiles order by display_name`));
    expect(anon.rows.map((r) => r.display_name)).toEqual(["Bart", "Leen"]);
    const n = await as(seekerB, (q) => q.query(`select type from public.notifications where type = 'listing_approved'`));
    expect(n.rowCount).toBe(1);
    const log = await as(admin, (q) => q.query(`select action from public.moderation_events where target_user_id = $1 order by id`, [seekerB.id]));
    expect(log.rows.map((x) => x.action)).toEqual(["set_role", "set_listing_status"]);
    await as(admin, (q) => q.query(`select public.admin_set_role($1, 'seeker')`, [seekerB.id]));
  });

  it("admin kan eigen rol niet afnemen en zichzelf niet schorsen", async () => {
    await expectDenied(as(admin, (q) => q.query(`select public.admin_set_role($1, 'seeker')`, [admin.id])));
    await expectDenied(as(admin, (q) => q.query(`select public.admin_set_account_status($1, 'suspended')`, [admin.id])));
  });

  it("geschorste gebruiker kan niets meer doen; partner kan hem niet meer schrijven", async () => {
    const conv = (await as("service", (q) => q.query(`select id from public.conversations where user_low = least($1::uuid,$2::uuid) and user_high = greatest($1::uuid,$2::uuid)`, [seekerA.id, listenerL.id]))).rows[0].id;
    await as(admin, (q) => q.query(`select public.admin_set_account_status($1, 'suspended', 'Test')`, [seekerA.id]));
    await expectDenied(as(seekerA, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'x')`, [conv, seekerA.id])));
    const upd = await as(seekerA, (q) => q.query(`update public.profiles set story = 'x' where id = $1`, [seekerA.id]));
    expect(upd.rowCount).toBe(0);
    await expectDenied(as(seekerA, (q) => q.query(`select public.start_conversation($1)`, [listenerL.id])));
    await expectDenied(as(listenerL, (q) => q.query(`insert into public.messages (conversation_id, sender_id, body) values ($1, $2, 'x')`, [conv, listenerL.id])));
    await expectDenied(as(seekerA, (q) => q.query(`insert into public.blocks (blocker_id, blocked_id) values ($1, $2)`, [seekerA.id, listenerL.id])));
    const n = await as(seekerA, (q) => q.query(`select type from public.notifications where type = 'account_status'`));
    expect(n.rowCount).toBe(1);
    await as(admin, (q) => q.query(`select public.admin_set_account_status($1, 'active')`, [seekerA.id]));
    const ok = await as(seekerA, (q) => q.query(`update public.profiles set story = 'terug' where id = $1`, [seekerA.id]));
    expect(ok.rowCount).toBe(1);
  });

  it("admin ziet statistieken en alle profielen/voorkeuren", async () => {
    const s = await as(admin, (q) => q.query(`select public.admin_stats() as s`));
    expect(s.rows[0].s.users_total).toBe(5);
    expect(s.rows[0].s.reports_total).toBe(1);
    const prefs = await as(admin, (q) => q.query(`select count(*)::int as n from public.profile_preferences`));
    expect(prefs.rows[0].n).toBe(5);
    // admin kan voorkeuren van anderen niet wijzigen (enkel lezen)
    const upd = await as(admin, (q) => q.query(`update public.profile_preferences set email_on_message = false where user_id = $1`, [seekerA.id]));
    expect(upd.rowCount).toBe(0);
  });

  it("admin kan niet zomaar in niet-gemelde gesprekken lezen", async () => {
    const convB = (await as("service", (q) => q.query(`select id from public.conversations where user_low = least($1::uuid,$2::uuid) and user_high = greatest($1::uuid,$2::uuid)`, [seekerB.id, listenerL.id]))).rows[0].id;
    const m = await as(admin, (q) => q.query(`select id from public.messages where conversation_id = $1`, [convB]));
    expect(m.rowCount).toBe(0);
  });
});

describe("storage", () => {
  it("gebruiker kan enkel in eigen avatar-map uploaden", async () => {
    await as(seekerA, (q) => q.query(`insert into storage.objects (bucket_id, name, owner) values ('avatars', $1, $2)`, [`${seekerA.id}/foto.jpg`, seekerA.id]));
    await expectDenied(as(seekerA, (q) => q.query(`insert into storage.objects (bucket_id, name, owner) values ('avatars', $1, $2)`, [`${listenerL.id}/foto.jpg`, seekerA.id])));
    await expectDenied(as("anon", (q) => q.query(`insert into storage.objects (bucket_id, name) values ('avatars', 'x/foto.jpg')`)));
    const anonRead = await as("anon", (q) => q.query(`select name from storage.objects`));
    expect(anonRead.rowCount).toBe(0);
    const del = await as(seekerB, (q) => q.query(`delete from storage.objects where name = $1`, [`${seekerA.id}/foto.jpg`]));
    expect(del.rowCount).toBe(0);
  });

  it("bijlagen: enkel leden van het gesprek", async () => {
    const conv = (await as("service", (q) => q.query(`select id from public.conversations where user_low = least($1::uuid,$2::uuid) and user_high = greatest($1::uuid,$2::uuid)`, [seekerA.id, listenerL.id]))).rows[0].id;
    await as(seekerA, (q) => q.query(`insert into storage.objects (bucket_id, name, owner) values ('attachments', $1, $2)`, [`${conv}/beeld.png`, seekerA.id]));
    await expectDenied(as(seekerB, (q) => q.query(`insert into storage.objects (bucket_id, name, owner) values ('attachments', $1, $2)`, [`${conv}/hack.png`, seekerB.id])));
    const b = await as(seekerB, (q) => q.query(`select name from storage.objects where bucket_id = 'attachments'`));
    expect(b.rowCount).toBe(0);
  });
});

describe("account verwijderen", () => {
  it("anonimiseren wist eigen berichten; cascade verwijdert profiel en lidmaatschappen, gesprek blijft voor de ander", async () => {
    const conv = (await as("service", (q) => q.query(`select id from public.conversations where user_low = least($1::uuid,$2::uuid) and user_high = greatest($1::uuid,$2::uuid)`, [seekerA.id, listenerL.id]))).rows[0].id;
    await as(seekerA, (q) => q.query(`select public.anonymize_own_profile()`));
    const m = await as(listenerL, (q) => q.query(`select body, deleted_at from public.messages where conversation_id = $1 and sender_id = $2`, [conv, seekerA.id]));
    expect(m.rows.every((r) => r.body === "[bericht verwijderd]" && r.deleted_at)).toBe(true);
    // server-side wordt daarna auth.users verwijderd (service role); simuleer:
    await as("service", (q) => q.query(`delete from auth.users where id = $1`, [seekerA.id]));
    expect((await as("service", (q) => q.query(`select 1 from public.profiles where id = $1`, [seekerA.id]))).rowCount).toBe(0);
    const v = await as(listenerL, (q) => q.query(`select other_user_id, other_display_name from public.my_conversations where id = $1`, [conv]));
    expect(v.rows[0].other_user_id).toBeNull();
    expect(v.rows[0].other_display_name).toBeNull();
  });
});
