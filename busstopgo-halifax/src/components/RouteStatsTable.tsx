import type { RouteStat, RouteStatsResponse } from "@/lib/types";

type RouteStatsTableProps = {
  data: RouteStatsResponse;
};

function formatNumber(value: number | undefined, suffix = "") {
  if (value == null) return "—";
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`;
}

function RouteStatCard({ route }: { route: RouteStat }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md bg-halifax-navy px-2 text-xs font-bold text-white">
            {route.route}
          </span>
          {route.route_name && (
            <p className="text-sm font-medium text-slate-900">
              {route.route_name}
            </p>
          )}
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {[
          { label: "Buses", value: formatNumber(route.buses) },
          { label: "Speed", value: formatNumber(route.speed, " km/h") },
          { label: "On-Time", value: formatNumber(route.on_time, "%") },
          { label: "Delay", value: formatNumber(route.delay, " min") },
          { label: "Cancelled", value: formatNumber(route.cancelled) },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">{item.label}</dt>
            <dd className="mt-0.5 font-semibold text-slate-900">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function RouteStatsTable({ data }: RouteStatsTableProps) {
  const activeRoutes = [...data.routes].sort((a, b) => {
    const aBuses = a.buses ?? -1;
    const bBuses = b.buses ?? -1;
    if (bBuses !== aBuses) return bBuses - aBuses;
    return a.route.localeCompare(b.route, undefined, { numeric: true });
  });

  if (activeRoutes.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 sm:p-8 sm:text-base">
        No route statistics available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.summary && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Buses now", value: data.summary.buses_now },
            { label: "Active routes", value: data.summary.routes_active },
            { label: "Total routes", value: data.summary.total_routes },
            { label: "Cancelled today", value: data.summary.cancelled_today },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4"
            >
              <p className="text-xs text-slate-500 sm:text-sm">{item.label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
                {item.value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Halifax Transit Routes
          </h2>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            Live stats for {data.count ?? activeRoutes.length} routes
          </p>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {activeRoutes.map((route) => (
            <RouteStatCard key={route.route} route={route} />
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[640px] w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700 lg:px-5">
                  Route
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700 lg:px-5">
                  Buses
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700 lg:px-5">
                  Speed
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700 lg:px-5">
                  On-Time
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700 lg:px-5">
                  Delay
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700 lg:px-5">
                  Cancelled
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeRoutes.map((route) => (
                <tr key={route.route} className="hover:bg-slate-50/80">
                  <td className="px-4 py-4 lg:px-5">
                    <div className="flex min-w-[140px] items-center gap-3">
                      <span className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md bg-halifax-navy px-2 text-xs font-bold text-white">
                        {route.route}
                      </span>
                      {route.route_name && (
                        <span className="text-slate-600">{route.route_name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700 lg:px-5">
                    {formatNumber(route.buses)}
                  </td>
                  <td className="px-4 py-4 text-slate-700 lg:px-5">
                    {formatNumber(route.speed, " km/h")}
                  </td>
                  <td className="px-4 py-4 text-slate-700 lg:px-5">
                    {formatNumber(route.on_time, "%")}
                  </td>
                  <td className="px-4 py-4 text-slate-700 lg:px-5">
                    {formatNumber(route.delay, " min")}
                  </td>
                  <td className="px-4 py-4 text-slate-700 lg:px-5">
                    {formatNumber(route.cancelled)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}