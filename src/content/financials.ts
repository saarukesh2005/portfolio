/**
 * The Numbers app reads this file.
 *
 * It is `null` on purpose — I will not invent financial figures and put your
 * name on them. Fill it in from your BDL project spreadsheet and the app
 * renders the table and the trend charts automatically.
 *
 * The row labels below are the standard ratio set, so in most cases you only
 * need to type the numbers.
 */

export type FinancialRow = {
  label: string;
  group: string;
  /** "%", "×", "days", "₹ Cr" … shown after each value */
  unit?: string;
  /** one entry per year, same order as `years`; null for a year you don't have */
  values: (number | null)[];
  /** true when a lower number is the better outcome */
  lowerIsBetter?: boolean;
};

export type FinancialTable = {
  company: string;
  ticker?: string;
  source: string;
  years: string[];
  rows: FinancialRow[];
};

export const financials: FinancialTable | null = null;

/*  ── Template ───────────────────────────────────────────────────────────
    Delete `= null` above, then paste this in its place and fill the numbers.

export const financials: FinancialTable | null = {
  company: "Bharat Dynamics Limited",
  ticker: "NSE: BDL",
  source: "Audited annual reports, FY2020–FY2024",
  years: ["FY20", "FY21", "FY22", "FY23", "FY24"],
  rows: [
    { group: "Profitability", label: "Net Profit Margin", unit: "%",  values: [0, 0, 0, 0, 0] },
    { group: "Profitability", label: "Operating Margin",  unit: "%",  values: [0, 0, 0, 0, 0] },
    { group: "Profitability", label: "Return on Equity",  unit: "%",  values: [0, 0, 0, 0, 0] },
    { group: "Liquidity",     label: "Current Ratio",     unit: "×",  values: [0, 0, 0, 0, 0] },
    { group: "Liquidity",     label: "Quick Ratio",       unit: "×",  values: [0, 0, 0, 0, 0] },
    { group: "Efficiency",    label: "Inventory Turnover",unit: "×",  values: [0, 0, 0, 0, 0] },
    { group: "Efficiency",    label: "Debtor Days", unit: "days", values: [0, 0, 0, 0, 0], lowerIsBetter: true },
    { group: "Scale",         label: "Sales",          unit: "₹ Cr", values: [0, 0, 0, 0, 0] },
    { group: "Scale",         label: "Net Profit",     unit: "₹ Cr", values: [0, 0, 0, 0, 0] },
    { group: "Scale",         label: "Working Capital",unit: "₹ Cr", values: [0, 0, 0, 0, 0] },
  ],
};
─────────────────────────────────────────────────────────────────────────── */
