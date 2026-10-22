import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "./prisma";

// Signed-in user, or null. Also joins any trips this person was invited to.
export async function currentUserOrNull() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return null;
  if (user.email) {
    const invites = await db.invite.findMany({ where: { email: { equals: user.email, mode: "insensitive" } } });
    for (const inv of invites) {
      await db.tripMember.upsert({
        where: { tripId_userId: { tripId: inv.tripId, userId: user.id } },
        update: {},
        create: { tripId: inv.tripId, userId: user.id },
      });
      await db.invite.delete({ where: { id: inv.id } });
    }
  }
  return user;
}

export async function requireUser() {
  const user = await currentUserOrNull();
  if (!user) redirect("/signin");
  return user;
}

export const getCurrentUser = requireUser;

const mine = (userId: string) => ({ members: { some: { userId } } });

export async function getTrips() {
  const u = await requireUser();
  return db.trip.findMany({
    where: mine(u.id),
    orderBy: { startDate: "asc" },
    include: {
      places: true,
      expenses: true,
      members: { include: { user: true } },
      _count: { select: { activities: true } },
    },
  });
}

export async function getTrip(id: string) {
  const u = await requireUser();
  return db.trip.findFirst({
    where: { id, ...mine(u.id) },
    include: {
      members: { include: { user: true } },
      invites: true,
      places: true,
      reservations: { orderBy: { date: "asc" } },
      expenses: { include: { splits: true } },
      activities: { include: { place: true, expenses: true }, orderBy: [{ day: "asc" }, { startsAt: "asc" }] },
    },
  });
}

export async function getRecentExpenses() {
  const u = await requireUser();
  return db.expense.findMany({
    where: { trip: mine(u.id) },
    orderBy: { spentOn: "desc" },
    take: 20,
    include: { trip: true, payer: true },
  });
}

export async function getReservations() {
  const u = await requireUser();
  return db.reservation.findMany({
    where: { trip: mine(u.id) },
    orderBy: [{ date: "asc" }],
    include: { trip: true },
  });
}