"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./prisma";
import { equalSplit } from "./balances";
import { getCurrentUser } from "./queries";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const cents = (f: FormData, k: string) => Math.round(parseFloat(str(f, k) || "0") * 100);

export async function createTrip(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No signed-in user. Run `npx prisma db seed` first.");

  const title = str(formData, "title");
  const destination = str(formData, "destination");
  const startDate = new Date(str(formData, "startDate"));
  const endDate = new Date(str(formData, "endDate"));
  if (!title || !destination || isNaN(+startDate) || isNaN(+endDate) || endDate < startDate)
    throw new Error("Add a title, a destination, and an end date that is on or after the start date.");

  const trip = await db.trip.create({
    data: {
      title, destination, startDate, endDate,
      country: str(formData, "country") || null,
      currency: str(formData, "currency") || "PHP",
      budgetCents: cents(formData, "budget"),
      members: { create: { userId: user.id, role: "ORGANIZER" } },
    },
  });
  revalidatePath("/");
  revalidatePath("/trips");
  redirect(`/trips/${trip.id}`);
}

export async function addActivity(formData: FormData) {
  const tripId = str(formData, "tripId");
  const title = str(formData, "title");
  const day = parseInt(str(formData, "day"), 10);
  if (!tripId || !title || !(day >= 1)) throw new Error("Add a stop name and a day number of 1 or more.");

  await db.activity.create({
    data: {
      tripId, title, day,
      startsAt: str(formData, "startsAt") || null,
      estimatedCents: cents(formData, "estimate"),
      placeId: str(formData, "placeId") || null,
    },
  });
  revalidatePath(`/trips/${tripId}`);
}

export async function logExpense(formData: FormData) {
  const tripId = str(formData, "tripId");
  const title = str(formData, "title");
  const amountCents = cents(formData, "amount");
  const payerId = str(formData, "payerId");
  const splitIds = formData.getAll("splitWith").map(String);
  if (!tripId || !title || amountCents <= 0 || !payerId || splitIds.length === 0)
    throw new Error("Add what it was, an amount above zero, who paid, and who shares it.");

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
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/expenses");
  revalidatePath("/trips");
}

export async function savePlace(formData: FormData) {
    const tripId = str(formData, "tripId");
    const name = str(formData, "name");
    const lat = parseFloat(str(formData, "lat"));
    const lng = parseFloat(str(formData, "lng"));
    if (!tripId || !name || !Number.isFinite(lat) || !Number.isFinite(lng))
      throw new Error("Search for a place and pick a result first.");
  
    // Mapbox has no photos, so each place gets a map snapshot with a pin.
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const imageUrl = token
      ? `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/pin-l+13233f(${lng},${lat})/${lng},${lat},14,0/600x400@2x?access_token=${token}`
      : null;
  
    await db.place.create({ data: { tripId, name, category: str(formData, "category") || "Other", lat, lng, imageUrl } });
    revalidatePath("/", "layout");
  }
  
  export async function removePlace(formData: FormData) {
    const id = str(formData, "id");
    if (!id) return;
    await db.activity.updateMany({ where: { placeId: id }, data: { placeId: null } });
    await db.place.delete({ where: { id } });
    revalidatePath("/", "layout");
  }