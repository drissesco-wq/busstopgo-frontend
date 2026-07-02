"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type StopSearchFormProps = {
  actionPath?: string;
  initialStop?: string;
  buttonLabel?: string;
  autoFocus?: boolean;
};

export default function StopSearchForm({
  actionPath = "/departures",
  initialStop = "",
  buttonLabel = "Search",
  autoFocus = false,
}: StopSearchFormProps) {
  const router = useRouter();
  const [stopNumber, setStopNumber] = useState(initialStop);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = stopNumber.trim();
    if (!trimmed) return;
    router.push(`${actionPath}?stop_id=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch"
    >
      <label className="sr-only" htmlFor="stop-number">
        Stop number
      </label>
      <input
        id="stop-number"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Enter stop number (e.g. 6033)"
        value={stopNumber}
        onChange={(event) => setStopNumber(event.target.value)}
        autoFocus={autoFocus}
        className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-halifax-blue focus:ring-2 focus:ring-halifax-blue/20"
      />
      <button
        type="submit"
        className="min-h-11 w-full rounded-lg bg-halifax-blue px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-halifax-blue-dark sm:w-auto sm:text-sm"
      >
        {buttonLabel}
      </button>
    </form>
  );
}