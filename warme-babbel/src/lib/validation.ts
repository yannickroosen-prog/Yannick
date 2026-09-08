import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Geef een geldig e-mailadres op.");

export const passwordSchema = z
  .string()
  .min(10, "Kies een wachtwoord van minstens 10 tekens.")
  .max(72, "Maximaal 72 tekens.");

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Je naam moet minstens 2 tekens hebben.")
  .max(40, "Maximaal 40 tekens.");

export const registerSchema = z
  .object({
    displayName: displayNameSchema,
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
    acceptPrivacy: z.literal("on", { errorMap: () => ({ message: "Je moet akkoord gaan met het privacybeleid." }) }),
    // honeypot
    website: z.string().max(0, "Spam gedetecteerd.").optional(),
  })
  .refine((d) => d.password === d.passwordConfirm, { path: ["passwordConfirm"], message: "De wachtwoorden komen niet overeen." });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Vul je wachtwoord in."),
});

export const forgotSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({ password: passwordSchema, passwordConfirm: z.string() })
  .refine((d) => d.password === d.passwordConfirm, { path: ["passwordConfirm"], message: "De wachtwoorden komen niet overeen." });

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, "Vul je huidige wachtwoord in."), password: passwordSchema, passwordConfirm: z.string() })
  .refine((d) => d.password === d.passwordConfirm, { path: ["passwordConfirm"], message: "De wachtwoorden komen niet overeen." });

export const profileSchema = z.object({
  displayName: displayNameSchema,
  story: z.string().trim().max(3000, "Je verhaal mag maximaal 3000 tekens zijn.").optional().default(""),
  regions: z.array(z.string()).max(10).default([]),
  themes: z.array(z.string()).max(12).default([]),
  relations: z.array(z.string()).max(7).default([]),
  contactMethods: z.array(z.string()).max(5).default([]),
  ageGroup: z.string().optional().default(""),
  gender: z.string().optional().default(""),
  walkIn: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  isHidden: z.boolean().default(false),
  showPhotoPublic: z.boolean().default(true),
});

export const messageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1, "Schrijf eerst een bericht.").max(4000, "Maximaal 4000 tekens."),
});

export const reportSchema = z.object({
  category: z.enum(["ongewenst_gedrag", "spam", "ongepaste_inhoud", "intimidatie", "andere"]),
  description: z.string().trim().max(2000).optional().default(""),
  targetUserId: z.string().uuid().optional(),
  targetConversationId: z.string().uuid().optional(),
  targetMessageId: z.coerce.number().int().positive().optional(),
});

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export type FieldErrors = Record<string, string | undefined>;

export function zodErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
