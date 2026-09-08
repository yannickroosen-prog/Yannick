import { describe, expect, it } from "vitest";
import { registerSchema, loginSchema, profileSchema, messageSchema, reportSchema, zodErrors } from "@/lib/validation";

describe("registerSchema", () => {
  const base = { displayName: "Ann", email: "ANN@Example.com ", password: "een lang wachtwoord", passwordConfirm: "een lang wachtwoord", acceptPrivacy: "on" };

  it("aanvaardt geldige invoer en normaliseert e-mail", () => {
    const r = registerSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("ann@example.com");
  });
  it("weigert kort wachtwoord", () => {
    const r = registerSchema.safeParse({ ...base, password: "kort", passwordConfirm: "kort" });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodErrors(r.error).password).toMatch(/10 tekens/);
  });
  it("weigert niet-overeenkomende wachtwoorden", () => {
    const r = registerSchema.safeParse({ ...base, passwordConfirm: "iets anders helemaal" });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodErrors(r.error).passwordConfirm).toMatch(/komen niet overeen/);
  });
  it("vereist privacy-akkoord", () => {
    const r = registerSchema.safeParse({ ...base, acceptPrivacy: undefined });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodErrors(r.error).acceptPrivacy).toMatch(/privacybeleid/);
  });
  it("honeypot: ingevuld website-veld is spam", () => {
    const r = registerSchema.safeParse({ ...base, website: "http://spam" });
    expect(r.success).toBe(false);
  });
  it("weigert te korte of te lange naam", () => {
    expect(registerSchema.safeParse({ ...base, displayName: "A" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, displayName: "x".repeat(41) }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("vereist e-mail en wachtwoord", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.be", password: "x" }).success).toBe(true);
  });
});

describe("profileSchema", () => {
  it("vult defaults in", () => {
    const r = profileSchema.parse({ displayName: "Leen" });
    expect(r.regions).toEqual([]);
    expect(r.isAvailable).toBe(true);
    expect(r.story).toBe("");
  });
  it("beperkt verhaal tot 3000 tekens", () => {
    expect(profileSchema.safeParse({ displayName: "Leen", story: "x".repeat(3001) }).success).toBe(false);
  });
});

describe("messageSchema", () => {
  it("weigert lege of te lange berichten en ongeldige ids", () => {
    const id = "6f1a1b2c-3d4e-4f50-8a9b-0c1d2e3f4a5b";
    expect(messageSchema.safeParse({ conversationId: id, body: "   " }).success).toBe(false);
    expect(messageSchema.safeParse({ conversationId: id, body: "x".repeat(4001) }).success).toBe(false);
    expect(messageSchema.safeParse({ conversationId: "not-a-uuid", body: "hallo" }).success).toBe(false);
    expect(messageSchema.safeParse({ conversationId: id, body: " hallo " }).success).toBe(true);
  });
});

describe("reportSchema", () => {
  it("vereist geldige categorie", () => {
    expect(reportSchema.safeParse({ category: "iets" }).success).toBe(false);
    expect(reportSchema.safeParse({ category: "spam", targetMessageId: "12" }).success).toBe(true);
    expect(reportSchema.safeParse({ category: "spam", targetMessageId: "-1" }).success).toBe(false);
  });
});
