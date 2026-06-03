import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { slug: "cotton-wick", name: "Cotton Wick", displayOrder: 1, description: "Pure cotton wicks for everyday lamps." },
  { slug: "oil-lamp-wick", name: "Oil Lamp Wick", displayOrder: 2, description: "Long, steady-burning wicks for oil lamps." },
  { slug: "floating-wick", name: "Floating Wick", displayOrder: 3, description: "Floating wicks for water bowls and decorative lamps." },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  console.log("Seeded categories");
}

main().finally(() => prisma.$disconnect());
