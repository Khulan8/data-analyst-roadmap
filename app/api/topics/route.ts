import { prisma } from "@/lib/prisma";

// same rule the repo uses for file names: "VLOOKUP / HLOOKUP" -> "vlookup--hlookup"
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 _-]/g, "").replace(/ /g, "-");

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const slug = slugify(q);
  let topic = await prisma.topic.findFirst({ where: { slug } });
  if (!topic) {
    topic = await prisma.topic.findFirst({
      where: { OR: [{ slug: { startsWith: slug } }, { title: { contains: q } }] },
    });
  }
  return Response.json(topic);
}
