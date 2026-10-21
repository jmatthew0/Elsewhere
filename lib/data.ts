// Demo data. Replace with Prisma queries (see prisma/schema.prisma).
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

export const travelers = [
  { id: "ann", name: "Ann Stown" },
  { id: "emily", name: "Emily West" },
];

export const places = [
  { id: "colosseum", name: "Colosseum", category: "Sight", lat: 41.8902, lng: 12.4922, image: img("photo-1552832230-c0197dd311b5") },
  { id: "trastevere", name: "Trastevere", category: "Neighborhood", lat: 41.8896, lng: 12.4698, image: img("photo-1525874684015-58379d421a52") },
  { id: "pietrafitta", name: "La Locanda di Pietrafitta", category: "Stay", lat: 43.2994, lng: 11.4014, image: img("photo-1523531294919-4bcd7c65e216") },
  { id: "kyoto", name: "Kyoto temples", category: "Saved", lat: 35.0116, lng: 135.7681, image: img("photo-1493976040374-85c8e12f0c0e") },
  { id: "santorini", name: "Santorini", category: "Saved", lat: 36.3932, lng: 25.4615, image: img("photo-1570077188670-e3a8d69ac5ff") },
];

export const trip = {
  id: "rome",
  title: "Anniversary in Italy",
  where: "Rome and Tuscany",
  dates: "18–21 July",
  cover: img("photo-1529260830199-42c24126f198"),
  budget: 3400,
  days: [
    { label: "Thu 18 July", items: [
      { time: "07:20", title: "Flight to Rome (FCO)", est: 520, actual: 548, place: null },
      { time: "15:00", title: "Check in, La Locanda di Pietrafitta", est: 610, actual: 610, place: "pietrafitta" },
    ]},
    { label: "Fri 19 July", items: [
      { time: "09:30", title: "Colosseum and Forum tour", est: 90, actual: 90, place: "colosseum" },
      { time: "13:00", title: "Pasta workshop", est: 170, actual: 170, place: "trastevere" },
    ]},
  ],
  expenses: [
    { title: "Flights", amount: 548, payer: "ann", split: ["ann", "emily"] },
    { title: "La Locanda", amount: 610, payer: "ann", split: ["ann", "emily"] },
    { title: "Trattoria da Francesco", amount: 85, payer: "emily", split: ["ann", "emily"] },
    { title: "Colosseum tour", amount: 90, payer: "emily", split: ["ann", "emily"] },
  ],
};

export function balances() {
  const net: Record<string, number> = Object.fromEntries(travelers.map((t) => [t.id, 0]));
  for (const e of trip.expenses) {
    const share = e.amount / e.split.length;
    net[e.payer] += e.amount;
    e.split.forEach((u) => (net[u] -= share));
  }
  return net; // positive = is owed money
}
