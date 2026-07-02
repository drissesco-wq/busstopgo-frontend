import type { DeparturesResponse } from "@/lib/types";

type DeparturesListProps = {
  data: DeparturesResponse;
};

export default function DeparturesList({ data }: DeparturesListProps) {
  if (data.departures.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 sm:p-8 sm:text-base">
        No upcoming departures found for this stop.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          Stop {data.stop_id}
        </h2>
        <p className="mt-1 text-xs text-slate-600 sm:text-sm">
          {data.count ?? data.departures.length} upcoming departure
          {(data.count ?? data.departures.length) === 1 ? "" : "s"}
          {data.data_mode ? ` · ${data.data_mode} data` : ""}
        </p>
      </div>

      <ul className="divide-y divide-slate-100">
        {data.departures.map((departure, index) => (
          <li
            key={`${departure.route_number}-${departure.departure_time}-${index}`}
            className="px-4 py-4 sm:px-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <span className="inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-lg bg-halifax-navy px-2 text-sm font-bold text-white">
                  {departure.route_number}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-slate-900 sm:text-base">
                    {departure.destination}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
                    {departure.vehicle_id && (
                      <span>Vehicle {departure.vehicle_id}</span>
                    )}
                    {departure.is_live ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:shrink-0 sm:flex-col sm:items-end sm:justify-center sm:border-0 sm:pt-0 sm:text-right">
                <p className="text-xl font-semibold text-slate-900 sm:text-lg">
                  {departure.departure_time}
                </p>
                {departure.minutes_until_departure != null && (
                  <p className="text-sm text-slate-500">
                    {departure.minutes_until_departure === 0
                      ? "Departing now"
                      : `${departure.minutes_until_departure} min`}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}