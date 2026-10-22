import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function SignInPage() {
  if ((await auth())?.user) redirect("/");
  return (
    <main className="grid min-h-screen place-items-center bg-navy p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy font-display text-white">E</span>
        <h1 className="mt-4 font-display text-3xl">Elsewhere</h1>
        <p className="mt-2 text-sm text-navy-600">Sign in to plan trips and split costs with your travel partner.</p>
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}
        >
          <button className="w-full rounded-lg bg-navy px-5 py-3 text-sm font-medium text-white hover:bg-navy-800">Continue with GitHub</button>
        </form>
      </div>
    </main>
  );
}