import { PrismaClient } from "@prisma/client";
import { equalSplit } from "../lib/balances";

const db = new PrismaClient();
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;
const both = (cents: number, ids: string[]) => ({ create: equalSplit(cents, ids).map((s) => s) });

async function main() {
  for (const m of [db.expenseSplit, db.expense, db.activity, db.reservation, db.place, db.tripMember, db.trip]) await (m as any).deleteMany();
  const ann = await db.user.upsert({ where: { email: "ann@example.com" }, update: {}, create: { name: "Ann Stown", email: "ann@example.com" } });
  const emily = await db.user.upsert({ where: { email: "emily@example.com" }, update: {}, create: { name: "Emily West", email: "emily@example.com" } });
  const ids = [ann.id, emily.id];

  const italy = await db.trip.create({ data: {
    title: "Anniversary in Italy", destination: "Rome and Tuscany", currency: "EUR", budgetCents: 340000,
    startDate: new Date("2027-07-18"), endDate: new Date("2027-07-21"),
    coverUrl: img("photo-1529260830199-42c24126f198"),
    members: { create: [{ userId: ann.id, role: "ORGANIZER" }, { userId: emily.id }] },
  }});
  const colosseum = await db.place.create({ data: { tripId: italy.id, name: "Colosseum", category: "Sight", lat: 41.8902, lng: 12.4922, imageUrl: img("photo-1552832230-c0197dd311b5") } });
  const trastevere = await db.place.create({ data: { tripId: italy.id, name: "Trastevere", category: "Neighborhood", lat: 41.8896, lng: 12.4698, imageUrl: img("photo-1525874684015-58379d421a52") } });
  const locanda = await db.place.create({ data: { tripId: italy.id, name: "La Locanda di Pietrafitta", category: "Stay", lat: 43.2994, lng: 11.4014, imageUrl: img("photo-1523531294919-4bcd7c65e216") } });

  const flight = await db.activity.create({ data: { tripId: italy.id, day: 1, startsAt: "07:20", title: "Flight to Rome (FCO)", estimatedCents: 52000 } });
  const stay = await db.activity.create({ data: { tripId: italy.id, day: 1, startsAt: "15:00", title: "Check in at La Locanda", estimatedCents: 61000, placeId: locanda.id } });
  const tour = await db.activity.create({ data: { tripId: italy.id, day: 2, startsAt: "09:30", title: "Colosseum and Forum tour", estimatedCents: 9000, placeId: colosseum.id } });
  await db.activity.create({ data: { tripId: italy.id, day: 2, startsAt: "13:00", title: "Pasta workshop", estimatedCents: 17000, placeId: trastevere.id } });

  const exp = (title: string, category: string, cents: number, payerId: string, day: number, activityId?: string) =>
    db.expense.create({ data: { tripId: italy.id, title, category, amountCents: cents, payerId, activityId, spentOn: new Date(Date.UTC(2027, 6, 17 + day)), splits: both(cents, ids) } });
  await exp("Flights", "Transport", 54800, ann.id, 1, flight.id);
  await exp("La Locanda", "Stay", 61000, ann.id, 1, stay.id);
  await exp("Colosseum tour", "Activities", 9000, emily.id, 2, tour.id);
  await exp("Trattoria da Francesco", "Dining", 8500, emily.id, 2);

  const japan = await db.trip.create({ data: {
    title: "Kyoto in spring", destination: "Kyoto, Japan", currency: "JPY", budgetCents: 40000000,
    startDate: new Date("2027-03-28"), endDate: new Date("2027-04-04"),
    coverUrl: img("photo-1493976040374-85c8e12f0c0e"),
    members: { create: [{ userId: ann.id, role: "ORGANIZER" }] },
  }});
  const kyoto = await db.place.create({ data: { tripId: japan.id, name: "Fushimi Inari", category: "Sight", lat: 34.9671, lng: 135.7727, imageUrl: img("photo-1493976040374-85c8e12f0c0e") } });
  await db.activity.create({ data: { tripId: japan.id, day: 1, startsAt: "06:00", title: "Fushimi Inari at sunrise", estimatedCents: 0, placeId: kyoto.id } });
  await db.expense.create({ data: { tripId: japan.id, title: "Hotel deposit", category: "Stay", amountCents: 8500000, payerId: ann.id, spentOn: new Date("2026-10-01"), splits: { create: [{ userId: ann.id, shareCents: 8500000 }] } } });
}

main().then(() => db.$disconnect()).catch((e) => { console.error(e); process.exit(1); });