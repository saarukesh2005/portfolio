import { npv, irr, xirr, amortise, requiredSip, requiredReturn, realReturn, dupont, altmanZ, cashCycle, paybackPeriod } from "./finance";

const near = (a: number | null, b: number, tol = 0.01) =>
  a !== null && Math.abs(a - b) < tol ? "PASS" : `FAIL (got ${a}, want ${b})`;

console.log("NPV  @10% of [-1000,500,500,500]    =", npv(0.1, [-1000, 500, 500, 500]).toFixed(2), near(npv(0.1,[-1000,500,500,500]), 243.43, 0.01));

const i1 = irr([-100, 110]);
console.log("IRR  [-100, 110]                    =", (i1! * 100).toFixed(4) + "%", near(i1! * 100, 10, 0.001));

const i2 = irr([-1000, 500, 500, 500]);
console.log("IRR  [-1000,500,500,500]            =", (i2! * 100).toFixed(2) + "%", near(i2! * 100, 23.3752, 0.01));

// Microsoft's own XIRR documentation example — the canonical check
const x = xirr([
  { date: new Date("2008-01-01"), amount: -10000 },
  { date: new Date("2008-03-01"), amount: 2750 },
  { date: new Date("2008-10-30"), amount: 4250 },
  { date: new Date("2009-02-15"), amount: 3250 },
  { date: new Date("2009-04-01"), amount: 2750 },
]);
console.log("XIRR Microsoft reference example     =", (x! * 100).toFixed(4) + "%", near(x! * 100, 37.3362535, 0.02));

const a = amortise({ principal: 2500000, annualRate: 8.75, months: 240 });
console.log("EMI  25,00,000 @8.75% / 240m         =", a!.emi.toFixed(2), near(a!.emi, 22092.9, 0.5));

// a 5,00,000 prepayment at month 60 must shorten the loan and cut interest
const b = amortise({ principal: 2500000, annualRate: 8.75, months: 240, prepayments: [{ month: 60, amount: 500000, recurring: false }] });
console.log("Prepay 5L at m60 → months            =", b!.monthsTaken, b!.monthsTaken < 240 ? "PASS (shorter)" : "FAIL");
console.log("Prepay 5L at m60 → interest saved    =", Math.round(a!.totalInterest - b!.totalInterest), (a!.totalInterest > b!.totalInterest) ? "PASS" : "FAIL");

// no-prepayment schedule must close out exactly at the stated tenure
console.log("Schedule length without prepayment   =", a!.monthsTaken, a!.monthsTaken === 240 ? "PASS" : "FAIL");

const sip = requiredSip(10000000, 12, 15);
console.log("SIP needed for 1cr @12% / 15y        =", Math.round(sip!), sip! > 0 ? "PASS (positive)" : "FAIL");

// round-trip: that SIP, compounded, must land back on the target
const r = 12 / 12 / 100, n = 180;
const fv = sip! * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
console.log("  round-trip future value            =", Math.round(fv), near(fv, 10000000, 1));

const rr = requiredReturn(10000000, 25000, 15);
console.log("Return needed, 25k/m → 1cr in 15y    =", rr!.toFixed(3) + "%", rr! > 0 && rr! < 50 ? "PASS (plausible)" : "FAIL");

console.log("Real return 12% nominal, 6% infl     =", realReturn(12, 6).toFixed(4) + "%", near(realReturn(12, 6), 5.6604, 0.001));

console.log("Payback [-1000,400,400,400]          =", paybackPeriod([-1000,400,400,400])?.toFixed(2), near(paybackPeriod([-1000,400,400,400]), 2.5, 0.01));

// DuPont must reconstruct ROE exactly
const F = { netProfit: 262, operatingProfit: 395, interest: 48, revenue: 2450, totalAssets: 2610, equity: 1460 };
const dp = dupont(F)!;
console.log("DuPont ROE                           =", dp.roe.toFixed(4) + "%", near(dp.roe, (262/1460)*100, 0.0001));

const z = altmanZ({ currentAssets: 1180, currentLiabilities: 640, totalAssets: 2610, retainedEarnings: 900, operatingProfit: 395, equity: 1460, revenue: 2450 })!;
console.log("Altman Z'                            =", z.z.toFixed(3), z.zone, z.z > 0 ? "PASS" : "FAIL");

const cc = cashCycle({ inventory: 430, cogs: 1570, receivables: 395, revenue: 2450, payables: 380 })!;
console.log("Cash conversion cycle                =", cc.ccc.toFixed(1), "days", near(cc.dio, (430/1570)*365, 0.01));

// degenerate inputs must return null rather than nonsense
console.log("IRR of all-positive flows            =", irr([100, 200]), irr([100,200]) === null ? "PASS (null)" : "FAIL");
console.log("Amortise with zero principal         =", amortise({principal:0,annualRate:9,months:12}), amortise({principal:0,annualRate:9,months:12}) === null ? "PASS (null)" : "FAIL");
