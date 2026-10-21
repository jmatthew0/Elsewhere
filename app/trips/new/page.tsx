import Link from "next/link";
import NewTripForm from "@/components/NewTripForm";

export default function NewTripPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <Link href="/trips" className="text-xs font-semibold tracking-wide text-navy-600 hover:text-navy">← BACK TO MY TRIPS</Link>
        <h1 className="mt-2 font-display text-3xl">New Trip</h1>
        <p className="text-sm text-navy-600">Set the basics now. You can add stops, places and expenses after.</p>
      </header>
      <NewTripForm />
    </div>
  );
}