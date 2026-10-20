/**
 * Ratio engine for the Analyser app.
 *
 * Figures go in as one consistent unit (₹ Cr, ₹ lakh, whatever) — every ratio
 * here is a pure ratio or a percentage, so the unit cancels out. The only
 * exception is Receivable Days, which is in days by construction.
 */

export type Figures = {
  revenue: number | null;
  cogs: number | null;
  operatingProfit: number | null;
  netProfit: number | null;
  interest: number | null;
  currentAssets: number | null;
  inventory: number | null;
  receivables: number | null;
  currentLiabilities: number | null;
  totalDebt: number | null;
  equity: number | null;
  totalAssets: number | null;
};

export const EMPTY_FIGURES: Figures = {
  revenue: null,
  cogs: null,
  operatingProfit: null,
  netProfit: null,
  interest: null,
  currentAssets: null,
  inventory: null,
  receivables: null,
  currentLiabilities: null,
  totalDebt: null,
  equity: null,
  totalAssets: null,
};

export type FieldDef = { key: keyof Figures; label: string; group: "Income statement" | "Balance sheet" };

export const FIELDS: FieldDef[] = [
  { key: "revenue", label: "Revenue", group: "Income statement" },
  { key: "cogs", label: "Cost of goods sold", group: "Income statement" },
  { key: "operatingProfit", label: "Operating profit (EBIT)", group: "Income statement" },
  { key: "interest", label: "Interest expense", group: "Income statement" },
  { key: "netProfit", label: "Net profit", group: "Income statement" },

  { key: "currentAssets", label: "Current assets", group: "Balance sheet" },
  { key: "inventory", label: "Inventory", group: "Balance sheet" },
  { key: "receivables", label: "Trade receivables", group: "Balance sheet" },
  { key: "currentLiabilities", label: "Current liabilities", group: "Balance sheet" },
  { key: "totalDebt", label: "Total debt", group: "Balance sheet" },
  { key: "equity", label: "Shareholders' equity", group: "Balance sheet" },
  { key: "totalAssets", label: "Total assets", group: "Balance sheet" },
];

export type Verdict = "strong" | "fair" | "weak" | "none";

export type Ratio = {
  name: string;
  group: "Profitability" | "Liquidity" | "Efficiency" | "Leverage";
  formula: string;
  value: number | null;
  unit: "%" | "×" | "days";
  verdict: Verdict;
  reading: string;
  /** which inputs were missing, so the UI can say what to fill in */
  needs: string[];
};

/** Division that refuses to lie: any missing or zero denominator yields null. */
const div = (a: number | null, b: number | null): number | null =>
  a === null || b === null || b === 0 ? null : a / b;

function band(v: number | null, strong: number, fair: number, higherIsBetter = true): Verdict {
  if (v === null) return "none";
  if (higherIsBetter) return v >= strong ? "strong" : v >= fair ? "fair" : "weak";
  return v <= strong ? "strong" : v <= fair ? "fair" : "weak";
}

function missing(f: Figures, keys: (keyof Figures)[]): string[] {
  return keys.filter((k) => f[k] === null).map((k) => FIELDS.find((d) => d.key === k)?.label ?? k);
}

export function computeRatios(f: Figures): Ratio[] {
  const grossProfit = f.revenue !== null && f.cogs !== null ? f.revenue - f.cogs : null;

  const r = (
    name: string,
    group: Ratio["group"],
    formula: string,
    value: number | null,
    unit: Ratio["unit"],
    verdict: Verdict,
    reading: string,
    needs: (keyof Figures)[]
  ): Ratio => ({ name, group, formula, value, unit, verdict, reading, needs: missing(f, needs) });

  const gross = div(grossProfit, f.revenue);
  const oper = div(f.operatingProfit, f.revenue);
  const net = div(f.netProfit, f.revenue);
  const roe = div(f.netProfit, f.equity);
  const roa = div(f.netProfit, f.totalAssets);
  const current = div(f.currentAssets, f.currentLiabilities);
  const quick =
    f.currentAssets !== null && f.inventory !== null
      ? div(f.currentAssets - f.inventory, f.currentLiabilities)
      : null;
  const assetTurn = div(f.revenue, f.totalAssets);
  const invTurn = div(f.cogs, f.inventory);
  const recDays = div(f.receivables, f.revenue);
  const de = div(f.totalDebt, f.equity);
  const cover = div(f.operatingProfit, f.interest);

  return [
    r("Gross Margin", "Profitability", "(Revenue − COGS) ÷ Revenue", gross === null ? null : gross * 100, "%",
      band(gross === null ? null : gross * 100, 40, 20),
      "How much of each rupee of sales survives the direct cost of producing it.",
      ["revenue", "cogs"]),

    r("Operating Margin", "Profitability", "EBIT ÷ Revenue", oper === null ? null : oper * 100, "%",
      band(oper === null ? null : oper * 100, 15, 8),
      "Profitability of the core business, before interest and tax.",
      ["operatingProfit", "revenue"]),

    r("Net Profit Margin", "Profitability", "Net profit ÷ Revenue", net === null ? null : net * 100, "%",
      band(net === null ? null : net * 100, 10, 5),
      "What finally reaches shareholders after every cost.",
      ["netProfit", "revenue"]),

    r("Return on Equity", "Profitability", "Net profit ÷ Equity", roe === null ? null : roe * 100, "%",
      band(roe === null ? null : roe * 100, 15, 10),
      "Return generated on the owners' money. Watch it alongside leverage — debt flatters ROE.",
      ["netProfit", "equity"]),

    r("Return on Assets", "Profitability", "Net profit ÷ Total assets", roa === null ? null : roa * 100, "%",
      band(roa === null ? null : roa * 100, 8, 4),
      "How hard the asset base is working, regardless of how it was financed.",
      ["netProfit", "totalAssets"]),

    r("Current Ratio", "Liquidity", "Current assets ÷ Current liabilities", current, "×",
      band(current, 1.5, 1),
      "Short-term obligations covered by short-term assets. Far above 3 can mean idle working capital.",
      ["currentAssets", "currentLiabilities"]),

    r("Quick Ratio", "Liquidity", "(Current assets − Inventory) ÷ Current liabilities", quick, "×",
      band(quick, 1, 0.7),
      "The same test with inventory stripped out — the stricter one.",
      ["currentAssets", "inventory", "currentLiabilities"]),

    r("Asset Turnover", "Efficiency", "Revenue ÷ Total assets", assetTurn, "×",
      band(assetTurn, 1, 0.5),
      "Revenue generated per rupee of assets. Capital-heavy sectors sit low by nature.",
      ["revenue", "totalAssets"]),

    r("Inventory Turnover", "Efficiency", "COGS ÷ Inventory", invTurn, "×",
      band(invTurn, 6, 3),
      "How many times stock is sold and replaced. Low means cash sitting on shelves.",
      ["cogs", "inventory"]),

    r("Receivable Days", "Efficiency", "(Receivables ÷ Revenue) × 365", recDays === null ? null : recDays * 365, "days",
      band(recDays === null ? null : recDays * 365, 45, 90, false),
      "Average days to collect from customers. Rising days can precede a cash crunch.",
      ["receivables", "revenue"]),

    r("Debt to Equity", "Leverage", "Total debt ÷ Equity", de, "×",
      band(de, 0.5, 1, false),
      "How much of the balance sheet is borrowed. Higher magnifies both returns and risk.",
      ["totalDebt", "equity"]),

    r("Interest Coverage", "Leverage", "EBIT ÷ Interest expense", cover, "×",
      band(cover, 5, 2),
      "How many times operating profit covers the interest bill. Below 1.5 is a warning.",
      ["operatingProfit", "interest"]),
  ];
}

/**
 * Illustrative figures only — a made-up manufacturer, used so the app opens
 * with something to look at. These are NOT any real company's accounts.
 */
export const SAMPLE: Figures = {
  revenue: 2450,
  cogs: 1570,
  operatingProfit: 395,
  interest: 48,
  netProfit: 262,
  currentAssets: 1180,
  inventory: 430,
  receivables: 395,
  currentLiabilities: 640,
  totalDebt: 520,
  equity: 1460,
  totalAssets: 2610,
};
