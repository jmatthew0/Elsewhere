"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./prisma";
import { equalSplit } from "./balances";
import { requireUser } from "./queries";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const cents = (f: FormData, k: string) => Math.round(parseFloat(str(f, k) || "0") * 100);
const MAX_AMOUNT = 10_000_000; // keeps cents inside the database's 32-bit limit
const over = (f: FormData, k: string) => parseFloat(str(f, k) || "0") > MAX_AMOUNT;
const refresh = () => revalidatePath("/", "layout");

type TripState = { error?: string; values?: Record<string, string> } | undefined;

async function memberOf(tripId: string) {
  const user = await requireUser();
  const m = await db.tripMember.findUnique({ where: { tripId_userId: { tripId, userId: user.id } } });
  if (!m) throw new Error("You're not a traveler on this trip.");
  return { user, role: m.role };
}

const COVERS: Record<string, string> = {
  tuscany: "photo-1529260830199-42c24126f198",
  coast: "photo-1570077188670-e3a8d69ac5ff",
  temples: "photo-1493976040374-85c8e12f0c0e",
  city: "photo-1552832230-c0197dd311b5",
};

async function coverFor(choice: string, destination: string, country: string) {
  if (COVERS[choice]) return `https://images.unsplash.com/${COVERS[choice]}?auto=format&fit=crop&w=900&q=70`;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;
  try {
    const q = encodeURIComponent([destination, country].filter(Boolean).join(", "));
    const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${q}&limit=1&access_token=${token}`);
    const [lng, lat] = (await res.json()).features?.[0]?.geometry?.coordinates ?? [];
    if (typeof lng !== "number") return null;
    return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/${lng},${lat},8,0/900x600@2x?access_token=${token}`;
  } catch {
    return null;
  }
}

/* ---------- Trips ---------- */

export async function createTrip(_prev: TripState, formData: FormData): Promise<TripState> {
  const values: Record<string, string> = {};
  formData.forEach((v, k) => { values[k] = String(v); });
  const fail = (error: string) => ({ error, values });

  const title = str(formData, "title");
  const destination = str(formData, "destination");
  const country = str(formData, "country");
  const startDate = new Date(str(formData, "startDate"));
  const endDate = new Date(str(formData, "endDate"));
  if (!title) return fail("Give your trip a name.");
  if (!destination) return fail("Add a destination.");
  if (isNaN(+startDate) || isNaN(+endDate)) return fail("Choose a start and end date.");
  if (endDate < startDate) return fail("The end date needs to be on or after the start date.");
  if (over(formData, "budget")) return fail("That budget is too large. Use 10,000,000 or less.");

  const user = await requireUser();
  const coverUrl = await coverFor(str(formData, "cover"), destination, country);
  let id: string;
  try {
    const trip = await db.trip.create({
      data: {
        title, destination, startDate, endDate, coverUrl,
        country: country || null,
        currency: str(formData, "currency") || "PHP",
        budgetCents: Math.max(0, cents(formData, "budget")),
        members: { create: { userId: user.id, role: "ORGANIZER" } },
      },
    });
    id = trip.id;
  } catch (e) {
    console.error(e);
    return fail("Couldn't save the trip. Try again.");
  }

  refresh();
  redirect(`/trips/${id}`);
}

export async function updateTrip(_prev: TripState, formData: FormData): Promise<TripState> {
  const values: Record<string, string> = {};
  formData.forEach((v, k) => { values[k] = String(v); });
  const fail = (error: string) => ({ error, values });

  const id = str(formData, "id");
  const title = str(formData, "title");
  const destination = str(formData, "destination");
  const country = str(formData, "country");
  const startDate = new Date(str(formData, "startDate"));
  const endDate = new Date(str(formData, "endDate"));
  if (!id) return fail("Couldn't tell which trip to edit.");
  if (!title) return fail("Give your trip a name.");
  if (!destination) return fail("Add a destination.");
  if (isNaN(+startDate) || isNaN(+endDate)) return fail("Choose a start and end date.");
  if (endDate < startDate) return fail("The end date needs to be on or after the start date.");
  if (over(formData, "budget")) return fail("That budget is too large. Use 10,000,000 or less.");

  try { await memberOf(id); } catch { return fail("You can't edit this trip."); }

  try {
    await db.trip.update({
      where: { id },
      data: { title, destination, startDate, endDate, country: country || null, budgetCents: Math.max(0, cents(formData, "budget")) },
    });
    const cover = str(formData, "cover");
    if (cover && cover !== "keep") await db.trip.update({ where: { id }, data: { coverUrl: await coverFor(cover, destination, country) } });
  } catch (e) {
    console.error(e);
    return fail("Couldn't save your changes. Try again.");
  }

  refresh();
  redirect(`/trips/${id}`);
}

export async function deleteTrip(formData: FormData) {
  const id = str(formData, "id");
  if (!id) return;
  const { role } = await memberOf(id);
  if (role !== "ORGANIZER") throw new Error("Only the trip organizer can delete a trip.");
  await db.trip.delete({ where: { id } });
  refresh();
  redirect("/trips");
}

/* ---------- Travel group ---------- */

export async function inviteMember(formData: FormData) {
  const tripId = str(formData, "tripId");
  const email = str(formData, "email").toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  await memberOf(tripId);

  const existing = await db.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existing) {
    await db.tripMember.upsert({
      where: { tripId_userId: { tripId, userId: existing.id } },
      update: {},
      create: { tripId, userId: existing.id },
    });
  } else {
    await db.invite.upsert({ where: { tripId_email: { tripId, email } }, update: {}, create: { tripId, email } });
  }
  refresh();
}

export async function cancelInvite(formData: FormData) {
  const inv = await db.invite.findUnique({ where: { id: str(formData, "id") } });
  if (!inv) return;
  await memberOf(inv.tripId);
  await db.invite.delete({ where: { id: inv.id } });
  refresh();
}

/* ---------- Stops ---------- */

export async function addActivity(formData: FormData) {
  const tripId = str(formData, "tripId");
  const title = str(formData, "title");
  const day = parseInt(str(formData, "day"), 10);
  if (!tripId || !title || !(day >= 1)) throw new Error("Add a stop name and a day number of 1 or more.");
  if (over(formData, "estimate")) throw new Error("That estimate is too large. Use 10,000,000 or less.");
  await memberOf(tripId);

  await db.activity.create({
    data: {
      tripId, title, day,
      startsAt: str(formData, "startsAt") || null,
      estimatedCents: cents(formData, "estimate"),
      placeId: str(formData, "placeId") || null,
    },
  });
  refresh();
}

export async function deleteActivity(formData: FormData) {
  const a = await db.activity.findUnique({ where: { id: str(formData, "id") } });
  if (!a) return;
  await memberOf(a.tripId);
  await db.activity.delete({ where: { id: a.id } });
  refresh();
}

/* ---------- Expenses ---------- */

export async function logExpense(formData: FormData) {
  const tripId = str(formData, "tripId");
  const title = str(formData, "title");
  const amountCents = cents(formData, "amount");
  const payerId = str(formData, "payerId");
  const splitIds = formData.getAll("splitWith").map(String);

  if (!tripId || !title || amountCents <= 0 || !payerId || splitIds.length === 0) {
    throw new Error("Add what it was, an amount above zero, who paid, and who shares it.");
  }
  if (over(formData, "amount")) throw new Error("That amount is too large. Use 10,000,000 or less.");
  await memberOf(tripId);

  const members = await db.tripMember.findMany({ where: { tripId } });
  const ok = new Set(members.map((m) => m.userId));
  if (!ok.has(payerId) || splitIds.some((id) => !ok.has(id)))
    throw new Error("Everyone on an expense needs to be a traveler on this trip.");

  await db.expense.create({
    data: {
      tripId, title, amountCents, payerId,
      category: str(formData, "category") || "Other",
      activityId: str(formData, "activityId") || null,
      spentOn: new Date(str(formData, "spentOn") || Date.now()),
      splits: { create: equalSplit(amountCents, splitIds) },
    },
  });
  refresh();
}

export async function deleteExpense(formData: FormData) {
  const e = await db.expense.findUnique({ where: { id: str(formData, "id") } });
  if (!e) return;
  await memberOf(e.tripId);
  await db.expense.delete({ where: { id: e.id } });
  refresh();
}

/* ---------- Places ---------- */

export async function savePlace(formData: FormData) {
  const tripId = str(formData, "tripId");
  const name = str(formData, "name");
  const lat = parseFloat(str(formData, "lat"));
  const lng = parseFloat(str(formData, "lng"));
  if (!tripId || !name || !Number.isFinite(lat) || !Number.isFinite(lng))
    throw new Error("Search for a place and pick a result first.");
  await memberOf(tripId);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const imageUrl = token
    ? `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/pin-l+13233f(${lng},${lat})/${lng},${lat},14,0/600x400@2x?access_token=${token}`
    : null;

  await db.place.create({ data: { tripId, name, category: str(formData, "category") || "Other", lat, lng, imageUrl } });
  refresh();
}

export async function removePlace(formData: FormData) {
  const p = await db.place.findUnique({ where: { id: str(formData, "id") } });
  if (!p) return;
  await memberOf(p.tripId);
  await db.activity.updateMany({ where: { placeId: p.id }, data: { placeId: null } });
  await db.place.delete({ where: { id: p.id } });
  refresh();
}

/* ---------- Reservations ---------- */

export async function addReservation(formData: FormData) {
  const tripId = str(formData, "tripId");
  const title = str(formData, "title");
  if (!tripId || !title) throw new Error("Add a title for the reservation.");
  if (over(formData, "cost")) throw new Error("That cost is too large. Use 10,000,000 or less.");
  await memberOf(tripId);

  const date = str(formData, "date");
  await db.reservation.create({
    data: {
      tripId, title,
      kind: str(formData, "kind") || "Other",
      status: str(formData, "status") || "BOOKED",
      reference: str(formData, "reference") || null,
      details: str(formData, "details") || null,
      date: date ? new Date(date) : null,
      costCents: Math.max(0, cents(formData, "cost")),
    },
  });
  refresh();
}

export async function deleteReservation(formData: FormData) {
  const r = await db.reservation.findUnique({ where: { id: str(formData, "id") } });
  if (!r) return;
  await memberOf(r.tripId);
  await db.reservation.delete({ where: { id: r.id } });
  refresh();
}