import type { TripPlanResponse } from "@/lib/types";

type TripPlanResultsProps = {
  data: TripPlanResponse;
};

function stepLabel(type: TripPlanResponse["steps"][number]["type"]) {
  if (type === "transfer") return "Transfer";
  if (type === "walk") return "Walk";
  return "Bus";
}

export default function TripPlanResults({ data }: TripPlanResultsProps) {
  if (data.steps.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 sm:p-8 sm:text-base">
        No route found between these stops.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          {data.from_stop} → {data.to_stop}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2 text-xs sm:gap-3 sm:text-sm">
          {data.total_duration_minutes != null && (
            <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-800 shadow-sm sm:px-3">
              {data.total_duration_minutes} min total
            </span>
          )}
          <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-800 shadow-sm sm:px-3">
            {data.transfers ?? 0} transfer{(data.transfers ?? 0) === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-800 shadow-sm sm:px-3">
            {data.steps.length} step{data.steps.length === 1 ? "" : "s"}
          </span>
          {data.simulated && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-800 sm:px-3">
              Estimated plan
            </span>
          )}
        </div>
      </div>

      <ol className="divide-y divide-slate-100">
        {data.steps.map((step) => (
          <li key={step.step_number} className="px-4 py-4 sm:px-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 sm:h-9 sm:w-9">
                {step.step_number}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {step.route_number && (
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-halifax-navy px-2 text-xs font-bold text-white">
                      {step.route_number}
                    </span>
                  )}
                  <p className="font-medium text-slate-900">
                    {stepLabel(step.type)}
                  </p>
                </div>

                <p className="mt-1 text-sm leading-snug text-slate-700 sm:text-base">
                  {step.instructions ??
                    `${step.from_stop} → ${step.to_stop}`}
                </p>

                {step.destination && (
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    {step.destination}
                  </p>
                )}

                <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1 sm:text-sm">
                  {step.departure_time && (
                    <span>Depart {step.departure_time}</span>
                  )}
                  {step.arrival_time && <span>Arrive {step.arrival_time}</span>}
                  {step.duration_minutes != null && (
                    <span>{step.duration_minutes} min</span>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}