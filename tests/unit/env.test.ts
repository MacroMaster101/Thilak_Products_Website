import { describe, it, expect } from "vitest";
import { parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("throws when a required var is missing", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
  });

  it("returns typed config when all vars present", () => {
    const env = parseEnv({
      DATABASE_URL: "postgres://x",
      NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service",
      RESEND_API_KEY: "re_x",
      CONTACT_EMAIL_TO: "store@example.com",
      NEXT_PUBLIC_WHATSAPP_NUMBER: "94770000000",
      NEXT_PUBLIC_STORE_PHONE: "+94770000000",
      NEXT_PUBLIC_STORE_EMAIL: "store@example.com",
      NEXT_PUBLIC_STORE_ADDRESS: "Colombo",
    });
    expect(env.DATABASE_URL).toBe("postgres://x");
    expect(env.CONTACT_EMAIL_TO).toBe("store@example.com");
  });

  it("throws for an invalid field value", () => {
    expect(() =>
      parseEnv({
        DATABASE_URL: "postgres://x",
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
        SUPABASE_SERVICE_ROLE_KEY: "service",
        RESEND_API_KEY: "re_x",
        CONTACT_EMAIL_TO: "store@example.com",
        NEXT_PUBLIC_WHATSAPP_NUMBER: "94770000000",
        NEXT_PUBLIC_STORE_PHONE: "+94770000000",
        NEXT_PUBLIC_STORE_EMAIL: "store@example.com",
        NEXT_PUBLIC_STORE_ADDRESS: "Colombo",
      })
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
});
