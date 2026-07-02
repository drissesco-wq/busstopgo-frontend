"use client";

import PageShell from "@/components/PageShell";
import TripPlanResults from "@/components/TripPlanResults";
import { ApiError, fetchTripPlan } from "@/lib/api";
import type { TripPlanResponse } from "@/lib/types";
import { FormEvent, useCallback, useEffect, useState } from "react";

function getStopsFromUrl(): { from: string; to: string } {
  if (typeof window === "undefined") return { from: "", to: "" };
  const params = new URLSearchParams(window.location.search);
  return {
    from: params.get("from_stop_id") ?? params.get("from_stop") ?? "",
    to: params.get("to_stop_id") ?? params.get("to_stop") ?? "",
  };
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-halifax-blue" />
      <p className="font-medium text-slate-900">Planning your trip…</p>
      <p className="mt-1 text-sm text-slate-500">
        Finding the best route between your stops
      </p>
    </div>
  );
}

export default function TripPlannerPage() {
  const [fromStop, setFromStop] = useState("");
  const [toStop, setToStop] = useState("");
  const [activeFrom, setActiveFrom] = useState("");
  const [activeTo, setActiveTo] = useState("");
  const [data, setData] = useState<TripPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planTrip = useCallback(async (from: string, to: string) => {
    const trimmedFrom = from.trim();
    const trimmedTo = to.trim();
    if (!trimmedFrom || !trimmedTo) return;

    setLoading(true);
    setError(null);
    setActiveFrom(trimmedFrom);
    setActiveTo(trimmedTo);

    try {
      const result = await fetchTripPlan("halifax", trimmedFrom, trimmedTo);
      setData(result);
      const params = new URLSearchParams({
        from_stop_id: trimmedFrom,
        to_stop_id: trimmedTo,
      });
      window.history.replaceState(null, "", `/trip-planner?${params}`);
    } catch (err) {
      setData(null);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to plan trip. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { from, to } = getStopsFromUrl();
    if (from && to) {
      setFromStop(from);
      setToStop(to);
      planTrip(from, to);
    }
  }, [planTrip]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    planTrip(fromStop, toStop);
  }

  return (
    <PageShell
      title="Trip Planner"
      description="Plan a trip between two Halifax Transit stops."
    >
      <form
        onSubmit={handleSubmit}
        className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-8 sm:grid-cols-2 sm:p-5"
      >
        <div>
          <label
            htmlFor="from-stop"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            From stop
          </label>
          <input
            id="from-stop"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 6033"
            value={fromStop}
            onChange={(event) => setFromStop(event.target.value)}
            disabled={loading}
            className="min-h-11 w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none focus:border-halifax-blue focus:ring-2 focus:ring-halifax-blue/20 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label
            htmlFor="to-stop"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            To stop
          </label>
          <input
            id="to-stop"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 1000"
            value={toStop}
            onChange={(event) => setToStop(event.target.value)}
            disabled={loading}
            className="min-h-11 w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none focus:border-halifax-blue focus:ring-2 focus:ring-halifax-blue/20 disabled:bg-slate-50"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading || !fromStop.trim() || !toStop.trim()}
            className="min-h-11 w-full rounded-lg bg-halifax-blue px-6 py-3 text-base font-semibold text-white transition hover:bg-halifax-blue-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
          >
            {loading ? "Planning…" : "Plan Trip"}
          </button>
        </div>
      </form>

      {!activeFrom && !activeTo && !loading && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          Enter origin and destination stop numbers to plan your trip.
        </div>
      )}

      {loading && <LoadingState />}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-medium">Could not plan trip</p>
          <p className="mt-1 text-sm">{error}</p>
          {activeFrom && activeTo && (
            <button
              type="button"
              onClick={() => planTrip(activeFrom, activeTo)}
              className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-100"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {!loading && !error && data && <TripPlanResults data={data} />}
    </PageShell>
  );
}