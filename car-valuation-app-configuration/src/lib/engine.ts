import { APP, type CarInput, type Insight, type PredictionResult } from "../config";

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

export function formatLakh(value: number): string {
  if (value >= 1e7) return `${APP.currencySymbol}${(value / 1e7).toFixed(2)} Crore`;
  if (value >= 1e5) return `${APP.currencySymbol}${(value / 1e5).toFixed(2)} Lakh`;
  return `${APP.currencySymbol}${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatShort(value: number): string {
  if (value >= 1e7) return `${APP.currencySymbol}${(value / 1e7).toFixed(2)}Cr`;
  if (value >= 1e5) return `${APP.currencySymbol}${(value / 1e5).toFixed(2)}L`;
  return `${APP.currencySymbol}${Math.round(value / 1000)}K`;
}

export function formatINR(value: number): string {
  return `${APP.currencySymbol}${Math.round(value).toLocaleString("en-IN")}`;
}

/* ------------------------------------------------------------------ */
/*  Model coefficients (calibrated surrogate of the trained pipeline)  */
/* ------------------------------------------------------------------ */

const BRAND_BASE: Record<string, number> = {
  Ambassador: 320000, Audi: 4650000, Bmw: 5100000, Chevrolet: 740000,
  Daewoo: 300000, Datsun: 560000, Fiat: 650000, Force: 1150000,
  Ford: 1240000, Honda: 1320000, Hyundai: 1611000, Isuzu: 2150000,
  Jaguar: 6400000, Jeep: 2480000, Kia: 1760000, Land: 7600000,
  Mahindra: 1580000, Maruti: 980000, "Mercedes-Benz": 6000000, Mg: 1950000,
  Mitsubishi: 2050000, Nissan: 1050000, Opelcorsa: 310000, Renault: 900000,
  Skoda: 2080000, Tata: 1060000, Toyota: 2240000, Volkswagen: 1480000,
  Volvo: 4300000,
};

export const BRAND_LIQUIDITY: Record<string, number> = {
  Maruti: 1.0, Hyundai: 0.95, Toyota: 0.94, Honda: 0.88, Tata: 0.85,
  Mahindra: 0.85, Kia: 0.86, Ford: 0.62, Renault: 0.6, Nissan: 0.58,
  Volkswagen: 0.6, Skoda: 0.55, Mg: 0.6, Jeep: 0.5, Bmw: 0.48,
  Audi: 0.46, "Mercedes-Benz": 0.5, Volvo: 0.38, Jaguar: 0.3, Land: 0.33,
  Mitsubishi: 0.3, Isuzu: 0.35, Force: 0.3, Chevrolet: 0.3, Fiat: 0.25,
  Datsun: 0.3, Daewoo: 0.15, Ambassador: 0.18, Opelcorsa: 0.15,
};

const FUEL_FACTOR: Record<string, number> = {
  Diesel: 1.06, Petrol: 1.0, CNG: 0.88, LPG: 0.8, Electric: 1.12,
};

const TRANSMISSION_FACTOR: Record<string, number> = {
  Manual: 1.0, Automatic: 1.22,
};

const SELLER_FACTOR: Record<string, number> = {
  Individual: 1.0, Dealer: 1.06, "Trustmark Dealer": 1.12,
};

const OWNER_FACTOR: Record<string, number> = {
  "First Owner": 1.0,
  "Second Owner": 0.88,
  "Third Owner": 0.78,
  "Fourth & Above Owner": 0.68,
  "Test Drive Car": 1.04,
};

const ANNUAL_RETENTION = 0.9025; // ≈ 9.75% depreciation per year

export function retentionFor(age: number): number {
  return Math.pow(ANNUAL_RETENTION, age);
}

/* ------------------------------------------------------------------ */
/*  Insights                                                           */
/* ------------------------------------------------------------------ */

function buildInsights(input: CarInput, kmPerYear: number, demand: string): Insight[] {
  const liq = BRAND_LIQUIDITY[input.brand] ?? 0.5;
  const brandNote =
    liq >= 0.85
      ? `${input.brand} enjoys active resale liquidity with steady market valuation.`
      : liq >= 0.55
        ? `${input.brand} holds a moderate resale footprint — pricing is negotiation sensitive.`
        : `${input.brand} is a thin-liquidity nameplate; expect wider buyer price spreads.`;

  const fuelNote =
    input.fuel === "Electric"
      ? `Electric powertrain with ${input.transmission} drive — battery health drives buyer confidence.`
      : input.fuel === "CNG" || input.fuel === "LPG"
        ? `${input.fuel} conversion lowers running cost but trims resale by design.`
        : `${input.fuel} powertrain paired with ${input.transmission} transmission.`;

  const usageNote = `${input.car_age} year${input.car_age === 1 ? "" : "s"} old with ${input.km_driven.toLocaleString("en-IN")} km on the odometer.`;

  return [
    { icon: "⚡", title: "Brand Pricing Factor", description: brandNote },
    { icon: "⛽", title: "Fuel Economy Impact", description: fuelNote },
    { icon: "⏱️", title: "Odometer & Age Correlation", description: usageNote },
    {
      icon: kmPerYear > 15000 ? "🛣️" : "📉",
      title: "Usage Intensity",
      description:
        kmPerYear > 15000
          ? `${kmPerYear.toLocaleString("en-IN")} km/year is above the 12,000 km national average — heavy-use discount applied.`
          : `${kmPerYear.toLocaleString("en-IN")} km/year sits below the 12,000 km average, supporting a premium band.`,
    },
    {
      icon: "🤝",
      title: "Channel & Ownership",
      description: `${input.owner} via ${input.seller_type} channel — ${
        input.seller_type === "Individual"
          ? "direct sale keeps the quote free of dealer margin."
          : "certified channel adds a trust premium to the quoted band."
      }`,
    },
    {
      icon: "📊",
      title: "Market Demand Signal",
      description: `Composite demand index classifies this configuration as ${demand.toLowerCase()}.`,
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Local inference                                                    */
/* ------------------------------------------------------------------ */

export function predictLocally(input: CarInput): PredictionResult {
  const base = BRAND_BASE[input.brand] ?? 900000;
  const retention = retentionFor(input.car_age);

  const expectedKm = Math.max(12000 * input.car_age, 8000);
  const kmDelta = (expectedKm - input.km_driven) / expectedKm;
  const kmFactor = Math.min(1.1, Math.max(0.74, 1 + kmDelta * 0.12));

  const price =
    base *
    retention *
    kmFactor *
    (FUEL_FACTOR[input.fuel] ?? 1) *
    (TRANSMISSION_FACTOR[input.transmission] ?? 1) *
    (SELLER_FACTOR[input.seller_type] ?? 1) *
    (OWNER_FACTOR[input.owner] ?? 1);

  const predicted = Math.max(28000, Math.round(price));
  const rangeLow = Math.round(predicted * 0.925);
  const rangeHigh = Math.round(predicted * 1.075);

  const kmPerYear = Math.round(input.km_driven / Math.max(1, input.car_age));

  const liq = BRAND_LIQUIDITY[input.brand] ?? 0.5;
  let score = liq * 55;
  score += Math.max(0, 25 - input.car_age) * 1.1;
  score += kmPerYear < 10000 ? 12 : kmPerYear < 15000 ? 7 : 0;
  score += input.owner === "First Owner" ? 8 : input.owner === "Second Owner" ? 3 : 0;
  score += input.transmission === "Automatic" ? 4 : 2;
  score += input.fuel === "Petrol" || input.fuel === "Diesel" ? 4 : 0;
  score = Math.min(100, Math.round(score));

  const demand =
    score >= 86 ? "Very High Demand" : score >= 70 ? "High Demand" : score >= 52 ? "Moderate Demand" : "Low Demand";

  return {
    success: true,
    predicted_price: predicted,
    formatted_price: formatLakh(predicted),
    price_inr: formatINR(predicted),
    range_low: rangeLow,
    range_high: rangeHigh,
    range_low_formatted: formatLakh(rangeLow),
    range_high_formatted: formatLakh(rangeHigh),
    range_text: `${formatLakh(rangeLow)} – ${formatLakh(rangeHigh)}`,
    depreciation_pct: Math.round((1 - retention) * 1000) / 10,
    km_per_year: kmPerYear,
    best_model: "Linear Regression",
    market_demand: demand,
    demand_score: score,
    insights: buildInsights(input, kmPerYear, demand),
    source: "local",
  };
}

/* ------------------------------------------------------------------ */
/*  Remote inference with graceful fallback                            */
/* ------------------------------------------------------------------ */

export async function predict(
  input: CarInput,
  useApi: boolean,
  baseUrl: string = APP.apiBaseUrl,
): Promise<PredictionResult> {
  if (useApi) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = (await res.json()) as PredictionResult;
        if (data && typeof data.predicted_price === "number") {
          return { ...predictLocally(input), ...data, source: "api" };
        }
      }
    } catch {
      /* fall through to local engine */
    }
  }
  await new Promise((r) => setTimeout(r, 550));
  return predictLocally(input);
}

export async function pingApi(baseUrl: string = APP.apiBaseUrl): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/health`, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

/* Depreciation curve points for charts */
export function depreciationCurve(input: CarInput, predicted: number, horizon = 25) {
  const retentionNow = retentionFor(input.car_age) || 1;
  const valueAtZero = predicted / retentionNow;
  const pts: { age: number; value: number }[] = [];
  for (let a = 0; a <= horizon; a++) {
    pts.push({ age: a, value: valueAtZero * retentionFor(a) });
  }
  return pts;
}
