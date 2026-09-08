"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, zodErrors, ALLOWED_IMAGE_TYPES, MAX_AVATAR_BYTES, type FieldErrors } from "@/lib/validation";

export type ProfileState = { errors?: FieldErrors; ok?: boolean; message?: string };

export async function updateProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const raw = {
    displayName: formData.get("displayName"),
    story: formData.get("story") ?? "",
    regions: formData.getAll("regions").map(String),
    themes: formData.getAll("themes").map(String),
    relations: formData.getAll("relations").map(String),
    contactMethods: formData.getAll("contactMethods").map(String),
    ageGroup: formData.get("ageGroup") ?? "",
    gender: formData.get("gender") ?? "",
    walkIn: formData.get("walkIn") === "on",
    isAvailable: formData.get("isAvailable") === "on",
    isHidden: formData.get("isHidden") === "on",
    showPhotoPublic: formData.get("showPhotoPublic") === "on",
  };
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { errors: zodErrors(parsed.error) };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errors: { form: "Je bent niet ingelogd." } };

  const d = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: d.displayName,
      story: d.story || null,
      regions: d.regions,
      themes: d.themes,
      relations: d.relations,
      contact_methods: d.contactMethods,
      age_group: d.ageGroup || null,
      gender: d.gender || null,
      walk_in: d.walkIn,
      is_available: d.isAvailable,
      is_hidden: d.isHidden,
      show_photo_public: d.showPhotoPublic,
    })
    .eq("id", user.id);
  if (error) {
    return { errors: { form: /valid_options|check constraint/i.test(error.message) ? "Een gekozen optie is niet (meer) geldig. Vernieuw de pagina en probeer opnieuw." : "Opslaan is niet gelukt. Probeer opnieuw." } };
  }
  revalidatePath("/mijn-profiel");
  revalidatePath(`/profiel/${user.id}`);
  revalidatePath("/profielen");
  return { ok: true, message: "Je profiel is opgeslagen." };
}

/** Controleert de 'magic bytes' zodat een hernoemd bestand geen afbeelding kan faken. */
function sniffImageType(bytes: Uint8Array): (typeof ALLOWED_IMAGE_TYPES)[number] | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length > 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  return null;
}

export async function uploadAvatarAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { errors: { avatar: "Kies eerst een foto." } };
  if (file.size > MAX_AVATAR_BYTES) return { errors: { avatar: "De foto is te groot (max. 5 MB)." } };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type || !(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) return { errors: { avatar: "Enkel JPG, PNG of WebP-afbeeldingen zijn toegelaten." } };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errors: { form: "Je bent niet ingelogd." } };

  const ext = type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("avatars").upload(path, bytes, { contentType: type, upsert: false, cacheControl: "3600" });
  if (upErr) return { errors: { avatar: "Uploaden is niet gelukt. Probeer een andere foto." } };

  const { data: current } = await supabase.from("profiles").select("avatar_path").eq("id", user.id).single();
  const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", user.id);
  if (error) return { errors: { avatar: "Opslaan is niet gelukt." } };
  if (current?.avatar_path && current.avatar_path !== path) {
    await supabase.storage.from("avatars").remove([current.avatar_path]);
  }
  revalidatePath("/mijn-profiel");
  revalidatePath("/", "layout");
  return { ok: true, message: "Je profielfoto is bijgewerkt." };
}

export async function removeAvatarAction(): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errors: { form: "Je bent niet ingelogd." } };
  const { data: current } = await supabase.from("profiles").select("avatar_path").eq("id", user.id).single();
  await supabase.from("profiles").update({ avatar_path: null }).eq("id", user.id);
  if (current?.avatar_path) await supabase.storage.from("avatars").remove([current.avatar_path]);
  revalidatePath("/mijn-profiel");
  revalidatePath("/", "layout");
  return { ok: true, message: "Je profielfoto is verwijderd." };
}
