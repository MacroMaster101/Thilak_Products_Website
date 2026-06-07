import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Load .env.local (preferred) or .env so that DATABASE_URL is available when
// this script is run via `tsx` (which does not auto-load .env files).
function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, "utf-8").split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const root = resolve(__dirname, "..");
if (existsSync(resolve(root, ".env.local"))) {
  loadEnvFile(resolve(root, ".env.local"));
} else {
  loadEnvFile(resolve(root, ".env"));
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { slug: "cotton-wick", name: "Cotton Wick", displayOrder: 1, description: "Pure cotton wicks for everyday lamps." },
  { slug: "oil-lamp-wick", name: "Oil Lamp Wick", displayOrder: 2, description: "Long, steady-burning wicks for oil lamps." },
  { slug: "floating-wick", name: "Floating Wick", displayOrder: 3, description: "Floating wicks for water bowls and decorative lamps." },
];

const products = [
  // Category 1: Cotton Wick
  {
    categorySlug: "cotton-wick",
    product: {
      slug: "premium-round-cotton-wicks",
      name: "Premium Round Cotton Wicks (Gol Batti)",
      description: "Traditional round-shaped wicks crafted from 100% organic long-staple cotton. These wicks (Gol Batti) are perfectly shaped to stand upright in clay or brass diyas, ensuring a tall, steady, and smoke-free flame. Ideal for daily prayers, temple worship, and meditation spaces.\n\n• Handmade from high-quality pure cotton\n• Stands upright easily\n• Clean, smoke-free flame\n• Perfect for standard ghee/oil diyas",
      isFeatured: true,
      isActive: true,
      images: ["/images/products/prod_round_wick.png"],
    },
    variants: [
      { label: "Pack of 100 wicks", price: 150, displayOrder: 1 },
      { label: "Pack of 250 wicks", price: 320, displayOrder: 2 },
      { label: "Pack of 500 wicks", price: 580, displayOrder: 3 },
    ]
  },
  {
    categorySlug: "cotton-wick",
    product: {
      slug: "classic-long-cotton-wicks",
      name: "Classic Long Cotton Wicks (Lambi Batti)",
      description: "Classic lambi batti wicks handcrafted with precision. Designed for horizontal laying in flat clay diyas, brass oil lamps, or deepas. Roll-finished to ensure uniform capillary draw of ghee or oil, providing a slow and steady burn that lasts longer.\n\n• Natural organic cotton fibers\n• Uniform density for stable oil absorption\n• Minimal ash residue\n• Ideal for festival lightings (Diwali, Karthigai, etc.)",
      isFeatured: false,
      isActive: true,
      images: ["/images/products/prod_long_wick.png"],
    },
    variants: [
      { label: "Pack of 150 wicks", price: 180, displayOrder: 1 },
      { label: "Pack of 300 wicks", price: 340, displayOrder: 2 },
    ]
  },

  // Category 2: Oil Lamp Wick
  {
    categorySlug: "oil-lamp-wick",
    product: {
      slug: "thick-woven-cotton-thread-spool",
      name: "Thick Woven Cotton Thread Spool",
      description: "A continuous spool of thick, woven cotton thread wick designed for larger traditional oil lamps. Cut to your desired length to fit tall standing lamps, hanging vilakkus, and church oil lamps. Highly durable weave prevents fraying while maintaining optimal oil draw.\n\n• Continuous roll format for custom lengths\n• Heavy-gauge tight weave\n• High absorption rate for thick oils (sesame, coconut, castor)\n• Clean-burning and long-lasting",
      isFeatured: true,
      isActive: true,
      images: ["/images/products/prod_spool_wick.png"],
    },
    variants: [
      { label: "10 Meter Roll", price: 250, displayOrder: 1 },
      { label: "25 Meter Roll", price: 550, displayOrder: 2 },
      { label: "50 Meter Roll", price: 980, displayOrder: 3 },
    ]
  },
  {
    categorySlug: "oil-lamp-wick",
    product: {
      slug: "premium-long-stem-brass-diya-wicks",
      name: "Premium Long-Stem Brass Diya Wicks",
      description: "Specially prepared wicks featuring a sturdy stem and tapered end, customized for traditional brass oil lamps. Fits snugly inside the lamp spouts without slipping, offering a flame that stays centered and burns cleanly from start to finish.\n\n• Snug-fit stem design\n• High structural stability (doesn't droop)\n• Tapered tip for easy lighting\n• Less carbon buildup",
      isFeatured: false,
      isActive: true,
      images: ["/images/products/prod_brass_wick.png"],
    },
    variants: [
      { label: "Pack of 50 wicks", price: 220, displayOrder: 1 },
      { label: "Pack of 100 wicks", price: 400, displayOrder: 2 },
    ]
  },

  // Category 3: Floating Wick
  {
    categorySlug: "floating-wick",
    product: {
      slug: "floating-cork-board-paper-wicks",
      name: "Floating Cork Board Paper Wicks",
      description: "Innovative floating wicks that sit on oil floating above water. Each pack comes with reusable cork discs and a set of replacement cotton wicks. Perfect for creating beautiful centerpiece water bowls in homes, hotels, and events.\n\n• Complete kit: 10 cork discs + 100 wicks\n• Works with any standard cooking or lamp oil floating on water\n• Creates a magical, calm floating light effect\n• Safe, steady, and flame-extinguishing if water level rises",
      isFeatured: true,
      isActive: true,
      images: ["/images/products/prod_floating_paper.png"],
    },
    variants: [
      { label: "Starter Kit (10 Corks + 100 Wicks)", price: 350, displayOrder: 1 },
      { label: "Refill Pack (150 cotton wicks)", price: 180, displayOrder: 2 },
    ]
  },
  {
    categorySlug: "floating-wick",
    product: {
      slug: "wax-coated-flower-floating-wicks",
      name: "Wax-Coated Flower Floating Wicks",
      description: "Charming flower-shaped floating wicks, pre-waxed for instant lighting and floatation stability. Place them in any decorative bowl filled with water and a thin layer of oil. Creates a floating garden of lights for special occasions, weddings, and prayer rooms.\n\n• Elegant flower disc design\n• Pre-waxed for quick igniting\n• Long float stability without sinking\n• Adds a luxurious decorative element",
      isFeatured: false,
      isActive: true,
      images: ["/images/products/prod_flower_wick.png"],
    },
    variants: [
      { label: "Pack of 30 wicks", price: 290, displayOrder: 1 },
      { label: "Pack of 60 wicks", price: 520, displayOrder: 2 },
    ]
  }
];

async function main() {
  // 1. Seed categories
  const categoryMap: Record<string, string> = {};
  for (const c of categories) {
    const upserted = await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    categoryMap[c.slug] = upserted.id;
  }
  console.log("Seeded categories");

  // 2. Seed products
  for (const p of products) {
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) {
      console.warn(`Category not found for slug: ${p.categorySlug}`);
      continue;
    }

    // Upsert the product
    const dbProduct = await prisma.product.upsert({
      where: { slug: p.product.slug },
      update: {
        name: p.product.name,
        description: p.product.description,
        isFeatured: p.product.isFeatured,
        isActive: p.product.isActive,
        images: p.product.images,
        categoryId: categoryId,
      },
      create: {
        slug: p.product.slug,
        name: p.product.name,
        description: p.product.description,
        isFeatured: p.product.isFeatured,
        isActive: p.product.isActive,
        images: p.product.images,
        categoryId: categoryId,
      },
    });

    // Delete existing variants for this product to prevent duplicates
    await prisma.productVariant.deleteMany({
      where: { productId: dbProduct.id },
    });

    // Create variants
    for (const v of p.variants) {
      await prisma.productVariant.create({
        data: {
          productId: dbProduct.id,
          label: v.label,
          price: v.price,
          displayOrder: v.displayOrder,
        },
      });
    }
    console.log(`Seeded product: ${p.product.name} with ${p.variants.length} variants`);
  }
  console.log("Seeding complete!");
}

main()
  .catch((e) => console.error("Error during seeding:", e))
  .finally(() => prisma.$disconnect());
