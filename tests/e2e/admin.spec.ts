import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.skip(!EMAIL || !PASSWORD, "E2E_ADMIN_EMAIL/PASSWORD not set");

test("unauthenticated admin redirects to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("admin can create a product that appears on the site", async ({ page }) => {
  await page.goto("/admin/login");
  // AdminLoginPage renders labelled inputs (Email / Password) + "Sign in" button.
  await page.getByLabel("Email").fill(EMAIL!);
  await page.getByLabel("Password").fill(PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  // Admin products page link to the create form.
  await page.getByRole("link", { name: "New product" }).click();

  const slug = `e2e-wick-${Date.now()}`;
  // ProductForm uses labelled fields; the category is a <select> and Save is the
  // submit button. Labels: "Name", "Slug ...", "Description", "Category",
  // "Base price ...".
  await page.getByLabel("Name").fill("E2E Wick");
  await page.getByLabel(/Slug/).fill(slug);
  await page.getByLabel("Description").fill("Created by Playwright.");
  await page.getByLabel("Category").selectOption({ index: 1 });
  await page.getByLabel(/Base price/).fill("99");
  await page.getByRole("button", { name: "Save" }).click();

  await page.goto(`/product/${slug}`);
  await expect(page.getByText("E2E Wick").first()).toBeVisible();
});
