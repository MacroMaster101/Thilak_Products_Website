import { describe, it, expect } from "vitest";
import { contactSchema, productSchema } from "@/lib/validation";

describe("contactSchema", () => {
  it("accepts a valid inquiry", () => {
    const r = contactSchema.safeParse({ name: "Asha", email: "a@b.com", message: "Do you ship to Kandy?" });
    expect(r.success).toBe(true);
  });
  it("rejects invalid email", () => {
    const r = contactSchema.safeParse({ name: "Asha", email: "nope", message: "hi there" });
    expect(r.success).toBe(false);
  });
  it("rejects too-short message", () => {
    const r = contactSchema.safeParse({ name: "Asha", email: "a@b.com", message: "hi" });
    expect(r.success).toBe(false);
  });
});

describe("productSchema", () => {
  it("accepts a product with variants and null basePrice", () => {
    const r = productSchema.safeParse({
      name: "Cotton Wick", slug: "cotton-wick", description: "Pure cotton.",
      categoryId: "cat1", basePrice: null, isFeatured: true, isActive: true,
      variants: [{ label: "Small", price: 50, displayOrder: 0 }],
    });
    expect(r.success).toBe(true);
  });
  it("rejects negative price", () => {
    const r = productSchema.safeParse({
      name: "X", slug: "x", description: "desc here", categoryId: "c",
      basePrice: -5, isFeatured: false, isActive: true, variants: [],
    });
    expect(r.success).toBe(false);
  });
});
