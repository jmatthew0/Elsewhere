import { db } from "./prisma";


export async function getCurrentUser() {
  return db.user.findFirst({ where: { email: process.env.SEED_EMAIL ?? "ann@example.com" } });
}


export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Error("No user found. Run `npx prisma db seed` first.");
  return u;
}

export const getTrips = () =>
  db.trip.findMany({
    orderBy: { startDate: "asc" },
    include: {
      places: true,
      expenses: true,
      members: { include: { user: true } },
      _count: { select: { activities: true } },
    },
  });

export const getTrip = (id: string) =>
  db.trip.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      places: true,
      reservations: { orderBy: { date: "asc" } },
      expenses: { include: { splits: true } },
      activities: { include: { place: true, expenses: true }, orderBy: [{ day: "asc" }, { startsAt: "asc" }] },
    },
  });

export const getRecentExpenses = () =>
  db.expense.findMany({ orderBy: { spentOn: "desc" }, take: 20, include: { trip: true, payer: true } });