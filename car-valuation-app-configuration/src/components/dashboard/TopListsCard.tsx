import { BENCHMARKS } from "../../config";
import { BRAND_LIQUIDITY } from "../../lib/engine";
import { Card, CardTitle } from "../ui";

const TOP_BRANDS = Object.entries(BRAND_LIQUIDITY)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3);

const TOP_MODELS = [...BENCHMARKS].sort((a, b) => b.test_r2 - a.test_r2).slice(0, 3);

export default function TopListsCard({ onPickBrand }: { onPickBrand: (brand: string) => void }) {
  return (
    <Card>
      <CardTitle>Market Leaders</CardTitle>
      <div className="mt-4 grid grid-cols-2 gap-6">
        <div>
          <div className="text-[11px] font-semibold text-ink">Top Brands</div>
          <ol className="mt-2.5 space-y-2">
            {TOP_BRANDS.map(([brand, liq], i) => (
              <li key={brand}>
                <button
                  type="button"
                  onClick={() => onPickBrand(brand)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-0.5 text-left text-[10px] text-muted transition hover:bg-canvas hover:text-ink"
                >
                  <span>
                    {i + 1}. <span className="text-ink">{brand}</span>
                  </span>
                  <span className="text-[9px] font-medium text-forest">{Math.round(liq * 100)}%</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-2 text-[9px] text-muted">by resale liquidity</div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-ink">Top Models</div>
          <ol className="mt-2.5 space-y-2">
            {TOP_MODELS.map((m, i) => (
              <li key={m.model} className="flex items-center justify-between gap-2 px-1 py-0.5 text-[10px] text-muted">
                <span className="truncate">
                  {i + 1}. <span className="text-ink">{m.model}</span>
                </span>
                <span className="shrink-0 text-[9px] font-medium text-forest">R² {m.test_r2.toFixed(2)}</span>
              </li>
            ))}
          </ol>
          <div className="mt-2 text-[9px] text-muted">by hold-out R²</div>
        </div>
      </div>
    </Card>
  );
}
