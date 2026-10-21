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

type TripState = { error?: string; values?: Record<string, string> } | undefined;

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

  let user;
  try {
    user = await requireUser();
  } catch {
    return fail("No user found. Run `npx prisma db seed` once, then try again.");
  }

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
    return fail("Couldn't save the trip. If you added the country field recently, run `npx prisma db push` and restart the app.");
  }

  revalidatePath("/", "layout");
  redirect(`/trips/${id}`);
}

export async function addActivity(formData: FormData) {
  const tripId = str(formData, "tripId");
  const title = str(formData, "title");
  const day = parseInt(str(formData, "day"), 10);
  if (!tripId || !title || !(day >= 1)) throw new Error("Add a stop name and a day number of 1 or more.");
  if (over(formData, "estimate")) throw new Error("That estimate is too large. Use 10,000,000 or less.");

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
    if (amountCents > MAX_AMOUNT * 100) throw new Error("That amount is too large. Use 10,000,000 or less.");
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
  
    revalidatePath("/", "layout");
    redirect(`/trips/${id}`);
  }
  
  export async function deleteTrip(formData: FormData) {
    const id = str(formData, "id");
    if (!id) return;
    await db.trip.delete({ where: { id } });
    revalidatePath("/", "layout");
    redirect("/trips");
  }
  
  export async function deleteActivity(formData: FormData) {
    const id = str(formData, "id");
    if (!id) return;
    await db.activity.delete({ where: { id } });
    revalidatePath("/", "layout");
  }
  
  export async function deleteExpense(formData: FormData) {
    const id = str(formData, "id");
    if (!id) return;
    await db.expense.delete({ where: { id } });
    revalidatePath("/", "layout");
  }