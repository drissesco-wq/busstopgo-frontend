import { NextRequest, NextResponse } from "next/server";
import { normalizeTripPlanResponse, simulateTripPlan } from "@/lib/trip-planner";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://5.161.181.78";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city") ?? "halifax";
  const fromStop =
    request.nextUrl.searchParams.get("from_stop_id") ??
    request.nextUrl.searchParams.get("from_stop");
  const toStop =
    request.nextUrl.searchParams.get("to_stop_id") ??
    request.nextUrl.searchParams.get("to_stop");

  if (!fromStop?.trim() || !toStop?.trim()) {
    return NextResponse.json(
      { error: "from_stop and to_stop are required" },
      { status: 400 },
    );
  }

  const from = fromStop.trim();
  const to = toStop.trim();
  const backendUrl = `${API_URL}/api/${city}/trip-planner?from_stop_id=${encodeURIComponent(from)}&to_stop_id=${encodeURIComponent(to)}`;

  try {
    const response = await fetch(backendUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (response.ok) {
      const data = normalizeTripPlanResponse(
        (await response.json()) as Record<string, unknown>,
      );
      return NextResponse.json(data);
    }

    if (response.status !== 404) {
      const body = await response.text();
      let payload: unknown;
      try {
        payload = JSON.parse(body);
      } catch {
        payload = { error: body || `Request failed (${response.status})` };
      }
      return NextResponse.json(payload, { status: response.status });
    }

    const simulated = await simulateTripPlan(city, from, to);
    return NextResponse.json(simulated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to plan trip.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}