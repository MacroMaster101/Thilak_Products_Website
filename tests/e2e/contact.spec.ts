// Load env FIRST so @/lib/prisma can read DATABASE_URL at import time (cleanup).
import "./_env";

import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/prisma";

const EMAIL = "e2e-contact@example.com";

test.afterAll(async () => {
  // The successful submission persists a row to the live ContactInquiry table.
  await prisma.contactInquiry.deleteMany({ where: { email: EMAIL } });
  await prisma.$disconnect();
});

test("contact form shows validation error then succeeds", async ({ page }) => {
  await page.goto("/contact");

  await page.getByLabel("Name").fill("E2E Tester");
  await page.getByLabel("Email").fill(EMAIL);

  // Too-short message triggers server-side validation (min 5 chars).
  await page.getByLabel("Message").fill("Hi");
  await page.getByRole("button", { name: "Send Message" }).click();

  await expect(page.getByText(/too short/i)).toBeVisible();

  // Now a valid message succeeds.
  await page.getByLabel("Message").fill("Do you deliver to Jaffna?");
  await page.getByRole("button", { name: "Send Message" }).click();

  await expect(page.getByText(/received your message/i)).toBeVisible();
});
