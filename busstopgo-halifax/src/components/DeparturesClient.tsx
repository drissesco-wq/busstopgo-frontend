"use client";

import DeparturesList from "@/components/DeparturesList";
import PageShell from "@/components/PageShell";
import { ApiError, fetchDepartures } from "@/lib/api";
import type { DeparturesResponse } from "@/lib/types";
import { FormEvent, useCallback, useEffect, useState } from "react";

function getStopIdFromUrl(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("stop_id") ?? params.get("stop") ?? "";
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-halifax-blue" />
      <p className="font-medium text-slate-900">Loading departures…</p>
      <p className="mt-1 text-sm text-slate-500">
        Fetching real-time data from Halifax Transit
      </p>
    </div>
  );
}

export default function DeparturesClient() {
  const [inputValue, setInputValue] = useState("");
  const [activeStopId, setActiveStopId] = useState("");
  const [data, setData] = useState<DeparturesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDepartures = useCallback(async (stopId: string) => {
    const trimmed = stopId.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setActiveStopId(trimmed);

    try {
      const result = await fetchDepartures("halifax", trimmed, 10);
      setData(result);
      window.history.replaceState(
        null,
        "",
        `/departures?stop_id=${encodeURIComponent(trimmed)}`,
      );
    } catch (err) {
      setData(null);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load departures. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stopId = getStopIdFromUrl();
    if (stopId) {
      setInputValue(stopId);
      loadDepartures(stopId);
    }
  }, [loadDepartures]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    loadDepartures(trimmed);
  }

  return (
    <PageShell
      title="Departures"
      description="Search by stop number to see upcoming Halifax Transit buses."
    >
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex w-full max-w-xl flex-col gap-3 sm:mb-8 sm:flex-row sm:items-stretch"
      >
        <label className="sr-only" htmlFor="stop-id">
          Stop number
        </label>
        <input
          id="stop-id"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Enter stop number (e.g. 6033)"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={loading}
          className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-halifax-blue focus:ring-2 focus:ring-halifax-blue/20 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="min-h-11 w-full rounded-lg bg-halifax-blue px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-halifax-blue-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {!activeStopId && !loading && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          Enter a stop number above to view departures.
        </div>
      )}

      {loading && <LoadingState />}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-medium">Could not load departures</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => loadDepartures(activeStopId)}
            className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && data && <DeparturesList data={data} />}
    </PageShell>
  );
}