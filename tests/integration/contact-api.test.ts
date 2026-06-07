import { describe, it, expect, vi, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: vi.fn().mockResolvedValue({ data: { id: "mock" }, error: null }) };
  },
}));

import { POST } from "@/app/api/contact/route";

afterAll(async () => {
  await prisma.contactInquiry.deleteMany({ where: { email: "test-api@example.com" } });
  await prisma.$disconnect();
});

function req(body: unknown) {
  return new Request("http://localhost/api/contact", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  it("rejects invalid input with 400", async () => {
    const res = await POST(req({ name: "", email: "bad", message: "hi" }));
    expect(res.status).toBe(400);
  });

  it("saves a valid inquiry and returns 200", async () => {
    const res = await POST(req({
      name: "API Tester", email: "test-api@example.com",
      message: "Do you deliver to Galle?", productName: "Cotton Wick",
    }));
    expect(res.status).toBe(200);
    const saved = await prisma.contactInquiry.findFirst({ where: { email: "test-api@example.com" } });
    expect(saved?.productName).toBe("Cotton Wick");
  });
});
