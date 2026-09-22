import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gramsFromKg, paiseFromKgPrice, formatKg, formatRupee, parseKg, parseRupeePerKg } from "./money.ts";
import {
  allocateFifo,
  assertCanSell,
  inputJournal,
  journalBalances,
  parseAcresCenti,
  remainingAfterCommit,
  settlementAmounts,
  settlementJournal,
  splitQtyWeighted,
} from "./kernel.ts";
import { exceptions, fpoPnl, processMass, trialBalance } from "./platform.ts";

describe("rural ERP money", () => {
  it("keeps mass in grams and money in paise", () => {
    assert.equal(gramsFromKg(840), 840000);
    assert.equal(paiseFromKgPrice(840000, 18500), 15540000);
    assert.equal(formatKg(840000), "840 kg");
    assert.match(formatRupee(15540000), /1,55,400/);
  });

  it("refuses empty or invented prices", () => {
    assert.equal(parseKg(""), null);
    assert.equal(parseKg("0"), null);
    assert.equal(parseRupeePerKg(""), null);
    assert.equal(parseRupeePerKg("0"), null);
    assert.equal(parseRupeePerKg("192"), 19200);
    assert.equal(parseKg("400"), 400000);
  });
});

describe("rural ERP kernel", () => {
  it("keeps remaining mass on the same lot body", () => {
    assert.equal(remainingAfterCommit(840000, 400000), 440000);
    assert.throws(() => remainingAfterCommit(510000, 600000));
  });

  it("refuses pledged or settled stock", () => {
    assert.throws(() => assertCanSell("pledged", 0));
    assert.throws(() => assertCanSell("in_warehouse", 1));
    assert.throws(() => assertCanSell("settled", 0));
    assert.doesNotThrow(() => assertCanSell("in_warehouse", 0));
    assert.doesNotThrow(() => assertCanSell("minted", 0));
  });

  it("posts a balanced settlement: cash in, farmgate + freight out", () => {
    const amounts = settlementAmounts(510000, 18500, 400);
    assert.equal(amounts.gross, 9435000);
    assert.equal(amounts.freight, 204000);
    assert.equal(amounts.farmgate, 9231000);
    const lines = settlementJournal({ variety: "Chakhao Poireiton", hoursToPay: 18, ...amounts });
    assert.equal(journalBalances(lines), true);
    assert.equal(
      lines.find((l) => l.account === "cash")?.side,
      "debit",
    );
  });

  it("posts a balanced input cost", () => {
    const lines = inputJournal("energy", 68800, "Drying hours, declared", "recie");
    assert.equal(journalBalances(lines), true);
  });

  it("allocates collective offtake FIFO and splits farmgate qty-weighted", () => {
    const take = allocateFifo(
      [
        { id: "a", remainingGrams: 400000 },
        { id: "b", remainingGrams: 440000 },
      ],
      600000,
    );
    assert.deepEqual(take, [
      { lotId: "a", qtyGrams: 400000 },
      { lotId: "b", qtyGrams: 200000 },
    ]);
    assert.throws(() => allocateFifo([{ id: "a", remainingGrams: 100 }], 200));

    const split = splitQtyWeighted(
      [
        { cellId: "c-enghi", qtyGrams: 510000 },
        { cellId: "c-ronghang", qtyGrams: 400000 },
      ],
      9231000,
    );
    const sum = split.reduce((n, s) => n + s.amountPaise, 0);
    assert.equal(sum, 9231000);
    assert.ok(split[0].amountPaise > split[1].amountPaise);
  });

  it("parses acres as centi-acres", () => {
    assert.equal(parseAcresCenti("2.4"), 240);
    assert.equal(parseAcresCenti("0"), null);
  });
});

describe("rural ERP platform", () => {
  it("turns remaining mass into saleable by a declared loss", () => {
    assert.equal(processMass(440000, 14000).saleableGrams, 426000);
    assert.throws(() => processMass(1000, 2000));
  });

  it("builds a trial balance and names open offtake as a deferred gate", () => {
    const journal = [
      { id: 1, entryId: "je", cellId: "c", lotId: "l", organId: "rupee", account: "cash", side: "debit" as const, amountPaise: 100, memo: "m", createdAt: "" },
      { id: 2, entryId: "je", cellId: "c", lotId: "l", organId: "rupee", account: "farmgate", side: "credit" as const, amountPaise: 90, memo: "m", createdAt: "" },
      { id: 3, entryId: "je", cellId: "c", lotId: "l", organId: "logistics", account: "freight", side: "credit" as const, amountPaise: 10, memo: "m", createdAt: "" },
    ];
    const tb = trialBalance(journal);
    assert.equal(tb.find((a) => a.account === "cash")?.debitPaise, 100);
    const pnl = fpoPnl(journal, [{ id: 1, cellId: "c", cellName: "n", kind: "energy", qty: 1, unit: "kWh", amountPaise: 20, memo: "m", createdAt: "" }]);
    assert.equal(pnl.grossPaise, 100);
    assert.equal(pnl.netToCellsPaise, 70);
    const gates = exceptions({
      journalBalanced: true,
      lots: [],
      receipts: [],
      orders: [{ id: "o", lotId: "l", poolId: null, variety: "v", cellName: "n", buyer: "b", qtyGrams: 1, pricePaisePerKg: 1, freightPaisePerKg: 0, status: "open", hoursToPay: null, paymentRef: null, createdAt: "", settledAt: null }],
      payouts: [],
    });
    assert.ok(gates.some((g) => g.code === "G2"));
  });
});
