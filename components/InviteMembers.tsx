import { inviteMember, cancelInvite } from "@/lib/actions";
import { field } from "@/lib/ui";

export default function InviteMembers({ tripId, invites }: { tripId: string; invites: { id: string; email: string }[] }) {
  return (
    <div className="mt-4 border-t border-sand pt-4">
      <form action={inviteMember} className="flex gap-2">
        <input type="hidden" name="tripId" value={tripId} />
        <input type="email" name="email" required placeholder="Invite by email" aria-label="Email to invite" className={field} />
        <button className="rounded-lg bg-navy px-4 text-sm font-medium text-white hover:bg-navy-800">Invite</button>
      </form>
      <p className="mt-1 text-xs text-navy-600">They join this trip when they sign in with that email.</p>
      {invites.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {invites.map((i) => (
            <li key={i.id} className="flex items-center justify-between">
              <span>{i.email} <span className="rounded bg-sand px-1.5 py-0.5 text-[10px] font-semibold">PENDING</span></span>
              <form action={cancelInvite}><input type="hidden" name="id" value={i.id} /><button className="text-xs text-navy-600 underline">Cancel</button></form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}