type Exp = { payerId: string; amountCents: number; splits: { userId: string; shareCents: number }[] };

/** Positive = is owed money, negative = owes money. */
export function balances(expenses: Exp[]) {
  const net: Record<string, number> = {};
  for (const e of expenses) {
    net[e.payerId] = (net[e.payerId] ?? 0) + e.amountCents;
    for (const s of e.splits) net[s.userId] = (net[s.userId] ?? 0) - s.shareCents;
  }
  return net;
}

/** Splits a total evenly; leftover cents go to the first people so shares add up exactly. */
export function equalSplit(total: number, userIds: string[]) {
  const base = Math.floor(total / userIds.length);
  let rest = total - base * userIds.length;
  return userIds.map((userId) => ({ userId, shareCents: base + (rest-- > 0 ? 1 : 0) }));
}