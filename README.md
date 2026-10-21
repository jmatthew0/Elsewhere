# Elsewhere

Plan trips, organize activities, and keep travel expenses under control.

## Run it
    npm install
    cp .env.example .env     # add DATABASE_URL and NEXT_PUBLIC_MAPBOX_TOKEN
    npx prisma db push
    npm run dev

The pages currently read demo data from `lib/data.ts`. Swap those calls for Prisma queries against `prisma/schema.prisma`.
Photos load from Unsplash; the map needs a free Mapbox token.
