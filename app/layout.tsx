import "./globals.css";
import { Fraunces, DM_Sans } from "next/font/google";
import Sidebar from "@/components/Sidebar";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = { title: "Elsewhere", description: "Plan trips, organize activities, and keep travel expenses under control." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-10 max-w-6xl">{children}</main>
        </div>
      </body>
    </html>
  );
}
