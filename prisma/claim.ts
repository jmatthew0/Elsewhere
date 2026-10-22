import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) return console.log("Usage: npx tsx prisma/claim.ts you@example.com");
  const user = await db.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (!user) return console.log("Sign in to the app once with that email first.");
  const trips = await db.trip.findMany();
  for (const t of trips)
    await db.tripMember.upsert({
      where: { tripId_userId: { tripId: t.id, userId: user.id } },
      update: {},
      create: { tripId: t.id, userId: user.id, role: "ORGANIZER" },
    });
  console.log(`Added you to ${trips.length} trips.`);
}
main().finally(() => db.$disconnect());