# Elsewhere

Plan trips, organize activities, and keep travel expenses under control.

Elsewhere is a trip planner with day-by-day itineraries, saved places on a map, reservations, and shared expenses. Amounts are shown in the currency of the country you're visiting, with the peso equivalent underneath.

## Features

- **Google sign-in.** Each person only sees their own trips.
- **Trips.** Create, edit and delete trips with a cover, country, dates and a budget.
- **Itinerary.** A day-by-day timeline of stops, with estimated and actual cost for each.
- **Saved places.** Search for any place with Mapbox, save it with a map pin, and see it on the Adventure Map.
- **Route map.** Stops linked to places are joined in order on a map.
- **Reservations.** Flights, hotels and bookings with Booked, Confirmed, Paid and Pending tags. They appear inside the right day of the timeline and on their own Reservations page.
- **Expenses.** Estimated versus actual spending, a daily or category chart, and recent transactions you can edit or delete.
- **Splitting.** Choose who paid and who shares each cost, and see who owes whom.
- **Invites.** Add a travel partner by email so you can split costs with a real account.
- **Currency conversion.** Trips can be priced in the currency you spend, with the peso equivalent shown beside it and a converter on the trip page.

## Tech stack

| Area | Tool |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | Auth.js (next-auth v5) with Google |
| Maps and search | Mapbox |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Tests | Vitest (Playwright is installed, no end-to-end tests written yet) |

## Getting started

You need Node.js 20 or newer, a free [Neon](https://neon.tech) database, a free [Mapbox](https://mapbox.com) account, and a Google Cloud project for sign-in.

### 1. Install

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://..."          # Neon connection string
AUTH_SECRET="..."                        # run: openssl rand -base64 32
AUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
NEXT_PUBLIC_MAPBOX_TOKEN="pk...."        # public Mapbox token
```

Never commit `.env`. It is listed in `.gitignore`.

### 3. Create the Google login

1. In [Google Cloud Console](https://console.cloud.google.com), create a project and open **Google Auth Platform**.
2. Fill in **Branding** (app name, support email, contact email).
3. Under **Clients**, create a **Web application** client:
   - Authorized JavaScript origin: `http://localhost:3000`
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy the client ID and secret into `.env`.
5. While the app is on **Testing**, only emails listed under **Audience → Test users** can sign in. Add yourself and anyone you want to invite.

### 4. Create the database tables

```bash
npx prisma db push
```

### 5. Run it

```bash
npm run dev
```

Open http://localhost:3000 and sign in with Google.

## Optional: sample data

```bash
SEED_EMAIL="you@gmail.com" npx prisma db seed
```

This loads two demo trips (Italy and Kyoto). **It deletes every trip in the database first**, so only run it on an empty database. If you already have trips and just need to attach them to a new login, use this instead:

```bash
npx tsx prisma/claim.ts you@gmail.com
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app in development |
| `npm run build` | Build for production |
| `npm test` | Run the unit tests (Vitest) |
| `npx prisma db push` | Sync the database with `prisma/schema.prisma` |
| `npx prisma generate` | Rebuild the Prisma client after schema changes |

## Project structure

```
app/
  page.tsx              Home dashboard
  trips/                My Trips, New Trip, trip detail and edit
  expenses/             Expenses overview and edit
  reservations/         Reservations overview and edit
  explore/              Explore destinations
  places/               Saved places
  signin/               Sign-in page
  api/auth/             Auth.js route
components/             UI pieces (forms, charts, map, sidebar)
lib/
  actions.ts            Server actions (every save checks trip membership)
  queries.ts            Database reads, limited to the signed-in user
  balances.ts           Splitting and "who owes whom"
  currency.ts           Money formatting and exchange rates
prisma/
  schema.prisma         Database models
  seed.ts, claim.ts     Sample data and account helper
auth.ts                 Auth.js configuration
```

## How some things work

- **Money is stored in cents** in the trip's currency, and amounts are capped at 10,000,000 so they fit the database.
- **Exchange rates** come from [Frankfurter](https://frankfurter.dev) and refresh hourly. If it can't be reached, the app uses rough built-in rates and says they're approximate.
- **Invites match on email.** A travel partner joins a trip when they sign in with the same Google email you invited.
- **Place photos:** Mapbox has no photos, so each saved place shows a map snapshot with a pin. Cover and Explore images come from Unsplash.

## Known limitations

- A trip's currency can't be changed after it's created, because existing amounts would be misread.
- A reservation's cost is not added to **Spent**. Log what you actually paid as an expense.
- Expenses are split equally between the people you tick.
- No receipt scanning, and no deployment setup yet.
- The Google app stays in Testing mode, so each new person must be added as a test user first.

## Troubleshooting

- **Red errors after changing the schema:** run `npx prisma db push`, then `npx prisma generate`, then restart the app and the TypeScript server in VS Code.
- **`redirect_uri_mismatch`:** the redirect URI in Google must be exactly `http://localhost:3000/api/auth/callback/google`.
- **Map is blank:** check `NEXT_PUBLIC_MAPBOX_TOKEN`, restart the app, and make sure at least one place is saved. Browser shields can also block the map.
- **Changes to `.env` do nothing:** stop the app and run `npm run dev` again.