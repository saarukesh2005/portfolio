import {
  simulate, compareStrategies, effectiveRate, stressTest, bufferCheck, minimumOnly,
  type Profile, type Debt,
} from "./debt";

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const near = (a: number, b: number, tol: number) => Math.abs(a - b) < tol;

const debt = (o: Partial<Debt> & { id: string; balance: number; annualRate: number; payment: number }): Debt =>
  ({ name: o.id, kind: "other", ...o } as Debt);

/* ── after-tax cost ─────────────────────────────────────────────── */
const home = debt({ id: "home", balance: 2000000, annualRate: 9, payment: 18000, kind: "home" });
// annual interest 1,80,000 is under the 2L cap, so fully relieved: 9 × (1 − 0.30)
check("home loan effective rate uses full Sec-24 relief under the cap",
  near(effectiveRate(home, 30), 6.3, 0.01), effectiveRate(home, 30).toFixed(3) + "%");

const bigHome = debt({ id: "big", balance: 6000000, annualRate: 9, payment: 50000, kind: "home" });
// interest 5,40,000, only 2,00,000 relieved → benefit is diluted
const bigEff = effectiveRate(bigHome, 30);
check("relief dilutes once annual interest exceeds the cap", bigEff > 6.3 && bigEff < 9, bigEff.toFixed(3) + "%");

const edu = debt({ id: "edu", balance: 500000, annualRate: 10, payment: 8000, kind: "education" });
check("education loan relief is uncapped (80E)", near(effectiveRate(edu, 30), 7, 0.001));

const personal = debt({ id: "pl", balance: 300000, annualRate: 14, payment: 10000, kind: "personal" });
check("personal loan gets no relief", near(effectiveRate(personal, 30), 14, 0.001));

/* ── the ordering insight ───────────────────────────────────────── */
// 12% non-deductible vs 9% home at 30% tax (6.3% after tax) → the 12% must go first
const taxProfile: Profile = {
  monthlyIncome: 150000, essentialExpenses: 50000, otherExpenses: 20000, savings: 300000, taxRate: 30,
  debts: [home, debt({ id: "auto", balance: 400000, annualRate: 12, payment: 12000, kind: "auto" })],
};
const taxOrder = simulate(taxProfile, 20000, "avalanche").order.map((o) => o.id);
check("avalanche targets the higher AFTER-TAX rate, not the higher headline rate",
  taxOrder[0] === "auto", "order: " + taxOrder.join(" → "));

/* ── the cascade ────────────────────────────────────────────────── */
const p: Profile = {
  monthlyIncome: 120000, essentialExpenses: 40000, otherExpenses: 15000, savings: 200000, taxRate: 0,
  debts: [
    debt({ id: "card", balance: 80000, annualRate: 42, payment: 2000, kind: "card", minPercent: 5 }),
    debt({ id: "pl", balance: 300000, annualRate: 14, payment: 10000, kind: "personal" }),
    debt({ id: "auto", balance: 500000, annualRate: 11, payment: 12000, kind: "auto" }),
  ],
};

const av = simulate(p, 15000, "avalanche");
check("every debt clears", av.order.length === 3 && !av.neverClears, `${av.months} months`);
check("avalanche clears the 42% card first", av.order[0].id === "card",
  "order: " + av.order.map((o) => o.id).join(" → "));
check("balance falls monotonically",
  av.rows.every((r, i) => i === 0 || r.totalBalance <= av.rows[i - 1].totalBalance + 0.01));
check("final balance is zero", near(av.rows[av.rows.length - 1].totalBalance, 0, 1));
check("paid exceeds borrowed by exactly the interest",
  near(av.totalPaid, 880000 + av.totalInterest, 5),
  `paid ${Math.round(av.totalPaid)}, interest ${Math.round(av.totalInterest)}`);

/* ── strategy comparison ────────────────────────────────────────── */
const cmp = compareStrategies(p, 15000);
check("snowball targets the smallest balance first", cmp.snowball.order[0].id === "card");
check("avalanche never costs more interest than snowball", cmp.interestSaved >= -0.01,
  `saves ₹${Math.round(cmp.interestSaved)}`);

// a case where the two genuinely disagree: small cheap debt vs large dear one
const split: Profile = { ...p, debts: [
  debt({ id: "small", balance: 40000, annualRate: 8, payment: 2000 }),
  debt({ id: "large", balance: 400000, annualRate: 22, payment: 9000 }),
]};
const sc = compareStrategies(split, 10000);
// NB: `order` is when each debt CLEARED. The small debt clears early on its own
// instalment under either strategy, so the real difference is where the surplus went.
check("the strategies aim the surplus at different debts",
  sc.avalanche.targets[0] === "large" && sc.snowball.targets[0] === "small" && !sc.sameTargeting,
  `avalanche→${sc.avalanche.targets.join(",")}  snowball→${sc.snowball.targets.join(",")}`);
check("avalanche is cheaper in that case", sc.interestSaved > 0, `₹${Math.round(sc.interestSaved)} cheaper`);

/* ── more surplus must never be worse ───────────────────────────── */
const low = simulate(p, 5000, "avalanche");
const high = simulate(p, 30000, "avalanche");
check("more surplus clears sooner and costs less",
  high.months < low.months && high.totalInterest < low.totalInterest,
  `${low.months}m/₹${Math.round(low.totalInterest)} vs ${high.months}m/₹${Math.round(high.totalInterest)}`);

/* ── the minimum-payment trap ───────────────────────────────────── */
const card = debt({ id: "card", balance: 80000, annualRate: 42, payment: 2000, kind: "card", minPercent: 5 });
const trap = minimumOnly(card);
check("minimum-only repayment drags on for years", trap.months > 60, `${trap.months} months`);
check("minimum-only interest exceeds the original balance", trap.interest > 80000,
  `₹${Math.round(trap.interest)} interest on ₹80,000`);

const hopeless = minimumOnly(debt({ id: "x", balance: 100000, annualRate: 42, payment: 500 }));
check("a payment below the interest is flagged as never clearing", hopeless.neverClears);

/* ── stress test ────────────────────────────────────────────────── */
const ok = stressTest(p, 15000, 10);
const bad = stressTest(p, 15000, 50);
check("a small pay cut is survivable", ok.survives);
check("a large pay cut opens a shortfall", !bad.survives && bad.shortfall > 0,
  `short ₹${Math.round(bad.shortfall)}/month`);
check("the buffer is converted into months of cover", bad.monthsCovered !== null && bad.monthsCovered > 0,
  `${bad.monthsCovered?.toFixed(1)} months`);

/* ── buffer guard ───────────────────────────────────────────────── */
const bc = bufferCheck(p, 150000, 6);
check("a prepayment that guts the buffer is refused", !bc.safe,
  `${bc.monthsHeld.toFixed(1)}m → ${bc.monthsAfterPrepay.toFixed(1)}m`);
check("no prepayment is safe when the buffer is already short",
  bufferCheck(p, 0, 6).alreadyShort && bufferCheck(p, 0, 6).maxSafePrepay === 0,
  `holds ${bufferCheck(p, 0, 6).monthsHeld.toFixed(1)} months, target 6`);

// a profile that genuinely has room to prepay
const flush: Profile = { ...p, savings: 700000 };
const headroom = bufferCheck(flush, 0, 6).maxSafePrepay;
check("the largest safe prepayment leaves exactly the target",
  near(bufferCheck(flush, headroom, 6).monthsAfterPrepay, 6, 0.01),
  `max safe ₹${Math.round(headroom)}`);

/* ── degenerate input ───────────────────────────────────────────── */
const none = simulate({ ...p, debts: [] }, 10000, "avalanche");
check("no debts produces an empty, finished plan", none.months === 0 && !none.neverClears);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
