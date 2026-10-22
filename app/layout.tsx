import "./globals.css";
import Link from "next/link";
import { Fraunces, DM_Sans } from "next/font/google";
import { Search, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { signOut } from "@/auth";
import { db } from "@/lib/prisma";
import { currentUserOrNull } from "@/lib/queries";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = { title: "Elsewhere", description: "Plan trips, organize activities, and keep travel expenses under control." };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUserOrNull();
  async function out() {
    "use server";
    await signOut({ redirectTo: "/signin" });
  }
  const recent = user
    ? (await db.trip.findMany({ where: { members: { some: { userId: user.id } } }, orderBy: { startDate: "desc" }, take: 2 })).map((t) => ({
        id: t.id,
        title: t.title,
        coverUrl: t.coverUrl,
        when: t.startDate.toLocaleDateString("en-PH", { month: "short", year: "numeric", timeZone: "UTC" }),
      }))
    : [];

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        {user ? (
          <div className="flex min-h-screen">
            <Sidebar name={user.name ?? user.email ?? "Traveler"} recent={recent} onSignOut={out} />
            <div className="flex min-w-0 flex-1 flex-col">
              <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-sand-400/40 bg-white px-8 py-3">
                <form action="/trips" className="relative max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-600" aria-hidden />
                  <input name="q" placeholder="Search trips and countries" aria-label="Search trips" className="w-full rounded-lg bg-sand-200 py-2 pl-9 pr-3 text-sm" />
                </form>
                <Link href="/trips/new" className="ml-auto flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">
                  <Plus className="h-4 w-4" aria-hidden /> New Trip
                </Link>
              </header>
              <main className="max-w-7xl p-8">{children}</main>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}