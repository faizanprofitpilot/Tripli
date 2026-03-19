import { Card, CardContent } from "@/components/ui/card";
import type { CostEstimate } from "@/types/trip";

interface CostBreakdownProps {
  cost: CostEstimate;
}

export function CostBreakdown({ cost }: CostBreakdownProps) {
  const rows = [
    { label: "Hotel", value: cost.hotel_total },
    { label: "Food", value: cost.food_total },
    { label: "Activities", value: cost.activities_total },
    { label: "Transportation", value: cost.transportation_total },
  ];
  return (
    <Card className="rounded-[var(--radius-card-lg)] border border-slate-200/60 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
      <CardContent className="p-6">
        <h3 className="font-bold text-slate-900 text-lg tracking-tight mb-5">Estimated trip cost</h3>
        <dl className="space-y-3.5">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-semibold text-slate-900">${value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex justify-between text-base font-bold mt-6 pt-4 text-slate-900" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <dt>Total</dt>
          <dd>${cost.total}</dd>
        </div>
      </CardContent>
    </Card>
  );
}
