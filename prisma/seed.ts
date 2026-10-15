import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

async function main() {
  const topics = JSON.parse(readFileSync("data/topics.json", "utf-8"));
  await prisma.topic.deleteMany();
  await prisma.topic.createMany({ data: topics });
  console.log(`Seeded ${topics.length} topics`);
}

main().finally(() => prisma.$disconnect());
