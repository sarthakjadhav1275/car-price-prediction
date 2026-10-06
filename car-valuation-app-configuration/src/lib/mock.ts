/* Deterministic pseudo-random generator so dashboard data is stable */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export type Range = 3 | 6 | 12;

export interface MonthGroup {
  label: string;
  bars: number[];
}

/** Weekly valuation volume grouped by month, ending with the current month */
export function valuationVolume(range: Range): MonthGroup[] {
  const perGroup = range === 3 ? 5 : range === 6 ? 3 : 2;
  const now = new Date();
  const groups: MonthGroup[] = [];
  for (let m = range - 1; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const seed = (d.getFullYear() * 12 + d.getMonth()) * 1013 + perGroup * 7;
    const rng = mulberry32(seed);
    const bars = Array.from({ length: perGroup }, () => Math.round(320 + rng() * 980));
    const name = MONTHS[d.getMonth()];
    groups.push({ label: range === 3 ? name : name.slice(0, 3), bars });
  }
  return groups;
}

export const SPARK_VALUATIONS = [4, 6, 5, 8, 7, 10, 9, 12, 11];
export const SPARK_LISTINGS = [9, 6, 10, 7, 12, 8, 13, 10, 14];
