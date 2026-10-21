import { describe, it, expect } from "vitest";
import { balances, equalSplit } from "../lib/balances";

describe("balances", () => {
  it("splits evenly and nets out", () => {
    const net = balances([
      { payerId: "ann", amountCents: 1000, splits: equalSplit(1000, ["ann", "emily"]) },
      { payerId: "emily", amountCents: 400, splits: equalSplit(400, ["ann", "emily"]) },
    ]);
    expect(net).toEqual({ ann: 300, emily: -300 });
  });
  it("keeps odd cents", () => {
    expect(equalSplit(100, ["a", "b", "c"]).map((s) => s.shareCents)).toEqual([34, 33, 33]);
  });
});