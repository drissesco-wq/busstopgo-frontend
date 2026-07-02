"use client";

import PageShell from "@/components/PageShell";
import RouteStatsTable from "@/components/RouteStatsTable";
import { ApiError, fetchRouteStats } from "@/lib/api";
import type { RouteStatsResponse } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

function LoadingState() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-halifax-blue" />
      <p className="font-medium text-slate-900">Loading route stats…</p>
      <p className="mt-1 text-sm text-slate-500">
        Fetching live performance data — this may take up to a minute
      </p>
    </div>
  );
}

export default function RouteStatsPage() {
  const [data, setData] = useState<RouteStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRouteStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchRouteStats("halifax");
      setData(result);
    } catch (err) {
      setData(null);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load route stats. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRouteStats();
  }, [loadRouteStats]);

  return (
    <PageShell
      title="Route Stats"
      description="Performance and reliability data for Halifax Transit routes."
    >
      {loading && <LoadingState />}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-medium">Could not load route stats</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={loadRouteStats}
            className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && data && <RouteStatsTable data={data} />}
    </PageShell>
  );
}