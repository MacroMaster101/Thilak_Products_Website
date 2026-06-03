import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  phone: z.string().optional(),
  productName: z.string().optional(),
  message: z.string().min(5, "Message is too short"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const variantSchema = z.object({
  label: z.string().min(1),
  price: z.number().int().nonnegative(),
  displayOrder: z.number().int().default(0),
});

export const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase, dashes only"),
  description: z.string().min(1),
  categoryId: z.string().min(1),
  basePrice: z.number().int().nonnegative().nullable(),
  images: z.array(z.string()).default([]),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  variants: z.array(variantSchema).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
