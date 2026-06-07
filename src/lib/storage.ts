// Server-only: uses the Supabase SERVICE ROLE key. Never import from a client component.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

let client: SupabaseClient | undefined;

function admin(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return client;
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Unsupported image type");
  if (file.size > MAX_BYTES) throw new Error("Image exceeds 5 MB");
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await admin()
    .storage.from(BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = admin().storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImage(publicUrl: string): Promise<void> {
  const marker = `/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  await admin().storage.from(BUCKET).remove([path]);
}
