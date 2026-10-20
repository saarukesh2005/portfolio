/**
 * Debt Escape — the engine.
 *
 * The hard parts, and why none of them is a formula:
 *
 *  1. Paying a debt off frees its instalment, which then cascades into the
 *     next one. Every payoff changes the schedule after it, so this has to be
 *     simulated month by month.
 *  2. Ordering by headline rate is wrong. A 9% home loan whose interest is
 *     deductible can cost less after tax than a 12% loan that is not, so the
 *     avalanche must sort by EFFECTIVE rate.
 *  3. Credit cards recompute their minimum from the balance each month, which
 *     is what makes minimum-only repayment take decades.
 *  4. Prepaying is not free: the cash came from somewhere, usually the buffer
 *     that stops the next emergency becoming new debt.
 */

export type DebtKind = "home" | "education" | "personal" | "card" | "auto" | "other";

export type Debt = {
  id: string;
  name: string;
  balance: number;
  annualRate: number;
  /** contractual monthly payment; for a card, the floor in rupees */
  payment: number;
  kind: DebtKind;
  /** cards recompute the minimum as a share of the balance each month */
  minPercent?: number;
};

export type Profile = {
  monthlyIncome: number;
  essentialExpenses: number;
  otherExpenses: number;
  savings: number;
  /** marginal income-tax rate, % — drives the after-tax cost of deductible debt */
  taxRate: number;
  debts: Debt[];
};

export type Strategy = "avalanche" | "snowball";

/* ───────────────────────── after-tax cost ───────────────────────── */

/** Section 24(b): self-occupied home loan interest, capped at ₹2,00,000 a year. */
const SEC_24_CAP = 200000;

/**
 * What a debt really costs after tax relief.
 *
 * Home loan relief is capped, so the benefit shrinks as a share of interest
 * once the annual interest exceeds the cap — which is why this is computed
 * from the live balance rather than applied as a flat discount. Education
 * loan interest (80E) is uncapped.
 */
export function effectiveRate(debt: Debt, taxRate: number): number {
  const t = Math.max(0, Math.min(taxRate, 60)) / 100;
  if (t === 0) return debt.annualRate;

  const annualInterest = debt.balance * (debt.annualRate / 100);
  if (annualInterest <= 0) return debt.annualRate;

  if (debt.kind === "home") {
    const relieved = Math.min(annualInterest, SEC_24_CAP);
    return debt.annualRate * (1 - t * (relieved / annualInterest));
  }
  if (debt.kind === "education") return debt.annualRate * (1 - t);
  return debt.annualRate;
}

/** The monthly payment actually due — cards recompute theirs from the balance. */
export function dueThisMonth(debt: Debt): number {
  const pct = debt.minPercent ? debt.balance * (debt.minPercent / 100) : 0;
  return Math.min(debt.balance * (1 + debt.annualRate / 1200), Math.max(debt.payment, pct));
}

/* ───────────────────────── simulation ───────────────────────── */

export type MonthRow = {
  month: number;
  paid: number;
  interest: number;
  principal: number;
  totalBalance: number;
  /** debts cleared this month */
  closed: string[];
};

export type Plan = {
  months: number;
  totalPaid: number;
  totalInterest: number;
  order: { id: string; name: string; month: number; interestPaid: number }[];
  rows: MonthRow[];
  /**
   * The debts the surplus was aimed at, in sequence. This is the real
   * difference between strategies — `order` only records when each debt
   * happened to clear, and a small debt clears early on its own instalment
   * whichever strategy is running.
   */
  targets: string[];
  /** true when the plan never clears within the horizon */
  neverClears: boolean;
};

const MAX_MONTHS = 600; // 50 years — past this a plan is not a plan

/**
 * Runs the repayment month by month.
 *
 * Every debt gets its contractual payment; the surplus goes to one target
 * chosen by the strategy. When a debt clears, its payment is freed and joins
 * the surplus — the cascade that makes a payoff order matter at all.
 */
export function simulate(profile: Profile, surplus: number, strategy: Strategy): Plan {
  const debts = profile.debts.map((d) => ({ ...d, interestPaid: 0 }));
  const rows: MonthRow[] = [];
  const order: Plan["order"] = [];
  const targets: string[] = [];

  let totalPaid = 0;
  let totalInterest = 0;
  let freed = 0; // instalments released by debts already cleared

  for (let month = 1; month <= MAX_MONTHS; month++) {
    const live = debts.filter((d) => d.balance > 0.5);
    if (live.length === 0) break;

    // 1. accrue interest
    let monthInterest = 0;
    for (const d of live) {
      const interest = d.balance * (d.annualRate / 1200);
      d.balance += interest;
      d.interestPaid += interest;
      monthInterest += interest;
    }

    // 2. contractual payments
    let monthPaid = 0;
    for (const d of live) {
      const due = Math.min(dueThisMonth(d), d.balance);
      d.balance -= due;
      monthPaid += due;
    }

    // 3. the surplus, plus anything freed, onto a single target
    let extra = surplus + freed;
    while (extra > 0.5) {
      const remaining = debts.filter((d) => d.balance > 0.5);
      if (remaining.length === 0) break;
      const target =
        strategy === "avalanche"
          ? remaining.reduce((a, b) =>
              effectiveRate(b, profile.taxRate) > effectiveRate(a, profile.taxRate) ? b : a
            )
          : remaining.reduce((a, b) => (b.balance < a.balance ? b : a));

      if (targets[targets.length - 1] !== target.id) targets.push(target.id);

      const pay = Math.min(extra, target.balance);
      target.balance -= pay;
      extra -= pay;
      monthPaid += pay;
    }

    // 4. anything cleared this month frees its instalment from here on
    const closed: string[] = [];
    for (const d of debts) {
      if (d.balance <= 0.5 && !order.some((o) => o.id === d.id)) {
        order.push({ id: d.id, name: d.name, month, interestPaid: d.interestPaid });
        closed.push(d.name);
        freed += d.payment;
        d.balance = 0;
      }
    }

    totalPaid += monthPaid;
    totalInterest += monthInterest;
    rows.push({
      month,
      paid: monthPaid,
      interest: monthInterest,
      principal: monthPaid - monthInterest,
      totalBalance: debts.reduce((s, d) => s + Math.max(0, d.balance), 0),
      closed,
    });
  }

  const outstanding = debts.reduce((s, d) => s + Math.max(0, d.balance), 0);
  return {
    months: rows.length,
    totalPaid,
    totalInterest,
    order,
    rows,
    targets,
    neverClears: outstanding > 0.5,
  };
}

/* ───────────────────────── comparisons ───────────────────────── */

export type Comparison = {
  avalanche: Plan;
  snowball: Plan;
  interestSaved: number;
  monthsSaved: number;
  /**
   * True when both strategies direct the surplus the same way — then there is
   * genuinely nothing to choose between them.
   */
  sameTargeting: boolean;
};

export function compareStrategies(profile: Profile, surplus: number): Comparison {
  const avalanche = simulate(profile, surplus, "avalanche");
  const snowball = simulate(profile, surplus, "snowball");
  return {
    avalanche,
    snowball,
    interestSaved: snowball.totalInterest - avalanche.totalInterest,
    monthsSaved: snowball.months - avalanche.months,
    sameTargeting: avalanche.targets.join() === snowball.targets.join(),
  };
}

/* ───────────────────────── stress test ───────────────────────── */

export type Stress = {
  dropPercent: number;
  newIncome: number;
  committed: number;
  shortfall: number;
  /** months the savings buffer can absorb the gap */
  monthsCovered: number | null;
  survives: boolean;
};

/** What a pay cut does to a plan that looked fine at full income. */
export function stressTest(profile: Profile, surplus: number, dropPercent: number): Stress {
  const newIncome = profile.monthlyIncome * (1 - dropPercent / 100);
  const committed =
    profile.essentialExpenses +
    profile.debts.reduce((s, d) => s + dueThisMonth(d), 0) +
    surplus;
  const gap = committed - newIncome;

  return {
    dropPercent,
    newIncome,
    committed,
    shortfall: Math.max(0, gap),
    monthsCovered: gap > 0 ? profile.savings / gap : null,
    survives: gap <= 0,
  };
}

/* ───────────────────────── buffer guard ───────────────────────── */

export type BufferCheck = {
  monthsHeld: number;
  monthsAfterPrepay: number;
  safe: boolean;
  /** largest prepayment that still leaves the target intact; 0 when already short */
  maxSafePrepay: number;
  /** the buffer is already below target before any prepayment */
  alreadyShort: boolean;
};

/**
 * Prepaying is not free. The cash came from the buffer that stops the next
 * emergency turning into fresh, usually dearer, debt.
 */
export function bufferCheck(profile: Profile, prepay: number, targetMonths = 6): BufferCheck {
  const burn = profile.essentialExpenses + profile.debts.reduce((s, d) => s + dueThisMonth(d), 0);
  if (burn <= 0)
    return { monthsHeld: Infinity, monthsAfterPrepay: Infinity, safe: true, maxSafePrepay: profile.savings, alreadyShort: false };

  const monthsHeld = profile.savings / burn;
  const monthsAfterPrepay = (profile.savings - prepay) / burn;
  return {
    monthsHeld,
    monthsAfterPrepay,
    safe: monthsAfterPrepay >= targetMonths,
    maxSafePrepay: Math.max(0, profile.savings - targetMonths * burn),
    alreadyShort: monthsHeld < targetMonths,
  };
}

/* ───────────────────────── the minimum-payment trap ───────────────────────── */

/** How long a card takes if only the minimum is ever paid — often decades. */
export function minimumOnly(debt: Debt): { months: number; interest: number; neverClears: boolean } {
  let balance = debt.balance;
  let interest = 0;
  for (let m = 1; m <= MAX_MONTHS; m++) {
    const accrued = balance * (debt.annualRate / 1200);
    balance += accrued;
    interest += accrued;
    const due = Math.min(Math.max(debt.payment, balance * ((debt.minPercent ?? 0) / 100)), balance);
    if (due <= accrued + 0.01) return { months: m, interest, neverClears: true }; // payment never beats interest
    balance -= due;
    if (balance <= 0.5) return { months: m, interest, neverClears: false };
  }
  return { months: MAX_MONTHS, interest, neverClears: true };
}
