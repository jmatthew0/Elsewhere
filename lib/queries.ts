import { db } from "./prisma";

// Until Auth.js is added, the signed-in user is the seeded Ann.
export const getCurrentUser = () => db.user.findUnique({ where: { email: "ann@example.com" } });

export const getTrips = () =>
  db.trip.findMany({ orderBy: { startDate: "asc" }, include: { places: true, expenses: true } });

export const getTrip = (id: string) =>
  db.trip.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      places: true,
      expenses: { include: { splits: true } },
      activities: { include: { place: true, expenses: true }, orderBy: [{ day: "asc" }, { startsAt: "asc" }] },
    },
  });

  export const getRecentExpenses = () =>
    db.expense.findMany({ orderBy: { spentOn: "desc" }, take: 20, include: { trip: true, payer: true } });