import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  if ((await auth())?.user) redirect("/");

  return (
    <main className="grid min-h-screen bg-sand-200 lg:grid-cols-2">
      <section className="relative hidden bg-navy lg:block">
        <Image src="https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1200&q=70" alt="" fill sizes="50vw" className="object-cover opacity-70" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
        <p className="absolute bottom-12 left-12 max-w-sm font-display text-4xl leading-tight text-white">Plan it together. Spend it fairly.</p>
      </section>

      <section className="grid place-items-center p-6">
        <div className="w-full max-w-sm">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy font-display text-white">E</span>
          <h1 className="mt-5 font-display text-3xl">Welcome to Elsewhere</h1>
          <p className="mt-2 text-navy-600">Plan trips, save places and bookings, and split costs with the people you travel with.</p>

          {error && <p role="alert" className="mt-5 rounded-lg bg-sand px-4 py-3 text-sm">We couldn't sign you in. Please try again.</p>}

          <form
            className="mt-6"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-sand-400 bg-white px-5 py-3 text-sm font-medium hover:bg-sand-200">
              <GoogleG /> Continue with Google
            </button>
          </form>

          <p className="mt-4 text-xs text-navy-600">We only use your name, email and photo. Travelling with someone? They should sign in with the same Google email you invited.</p>
        </div>
      </section>
    </main>
  );
}