import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  CONTACT_EMAIL_TO: z.string().email(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().min(1),
  NEXT_PUBLIC_STORE_PHONE: z.string().min(1),
  NEXT_PUBLIC_STORE_EMAIL: z.string().email(),
  NEXT_PUBLIC_STORE_ADDRESS: z.string().min(1),
});

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = schema.safeParse(source);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid/missing environment variables: ${missing}`);
  }
  return result.data;
}

let cached: Env | undefined;
export function getEnv(): Env {
  if (!cached) cached = parseEnv(process.env);
  return cached;
}
