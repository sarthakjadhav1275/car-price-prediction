import type { CarInput, PredictionResult } from "../config";
import AnalyticsCard from "../components/dashboard/AnalyticsCard";
import ActivityCard from "../components/dashboard/ActivityCard";
import DonutsCard from "../components/dashboard/DonutsCard";
import LiveValuationCard from "../components/dashboard/LiveValuationCard";
import TopListsCard from "../components/dashboard/TopListsCard";

export default function DashboardPage({
  input,
  result,
  loading,
  runs,
  onTransmission,
  onPickBrand,
}: {
  input: CarInput;
  result: PredictionResult;
  loading: boolean;
  runs: number;
  onTransmission: (v: string) => void;
  onPickBrand: (brand: string) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)]">
      <div className="grid content-start gap-4">
        <AnalyticsCard />
        <ActivityCard runs={runs} />
        <DonutsCard result={result} input={input} />
      </div>
      <div className="grid content-start gap-4">
        <LiveValuationCard input={input} result={result} loading={loading} onTransmission={onTransmission} />
        <TopListsCard onPickBrand={onPickBrand} />
      </div>
    </div>
  );
}
