import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.progress.findMany({ where: { done: true } });
  return Response.json(rows.map((r) => r.key));
}

export async function POST(req: Request) {
  const { key, done } = await req.json();
  if (done) {
    await prisma.progress.upsert({ where: { key }, update: { done: true }, create: { key, done: true } });
  } else {
    await prisma.progress.deleteMany({ where: { key } });
  }
  return Response.json({ ok: true });
}

export async function DELETE() {
  await prisma.progress.deleteMany();
  return Response.json({ ok: true });
}
