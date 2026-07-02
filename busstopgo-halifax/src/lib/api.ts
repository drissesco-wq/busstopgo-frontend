import { normalizeTripPlanResponse } from "./trip-planner";
import type {
  DeparturesResponse,
  RouteStat,
  RouteStatsResponse,
  TripPlanResponse,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://5.161.181.78";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseErrorResponse(response: Response): Promise<string> {
  let message = `Request failed (${response.status})`;
  try {
    const body = await response.json();
    if (body?.error) message = String(body.error);
    else if (body?.detail) message = String(body.detail);
    else if (body?.message) message = String(body.message);
  } catch {
    // Response body is not JSON.
  }
  return message;
}

function normalizeRouteStat(raw: Record<string, unknown>): RouteStat {
  const current = (raw.current ?? raw) as Record<string, unknown>;

  return {
    route: String(raw.route_number ?? raw.route ?? "—"),
    route_name: raw.route_name ? String(raw.route_name) : undefined,
    buses: num(current.buses ?? raw.buses ?? raw.bus_count),
    speed: num(current.speed_kmh ?? current.speed ?? raw.speed ?? raw.avg_speed),
    on_time: num(
      current.on_time_pct ?? current.on_time ?? raw.on_time ?? raw.on_time_pct,
    ),
    delay: num(current.delay_min ?? current.delay ?? raw.delay ?? raw.avg_delay),
    cancelled: num(current.cancelled ?? raw.cancelled ?? raw.cancelled_count),
  };
}

function num(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeRouteStatsResponse(data: Record<string, unknown>): RouteStatsResponse {
  const rawRoutes = Array.isArray(data.routes)
    ? data.routes
    : Array.isArray(data.data)
      ? data.data
      : [];

  const summary = data.summary as Record<string, unknown> | undefined;

  return {
    city: String(data.city ?? "halifax"),
    count: num(data.count) ?? rawRoutes.length,
    generated_at: num(data.generated_at ?? data.updated_at),
    routes: rawRoutes.map((route) =>
      normalizeRouteStat(route as Record<string, unknown>),
    ),
    summary: summary
      ? {
          buses_now: num(summary.buses_now),
          cancelled_today: num(summary.cancelled_today),
          routes_active: num(summary.routes_active),
          total_routes: num(summary.total_routes),
        }
      : undefined,
    error: data.error ? String(data.error) : undefined,
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorResponse(response), response.status);
  }

  return response.json() as Promise<T>;
}

export async function fetchDepartures(
  city: string,
  stopId: string,
  limit = 10,
): Promise<DeparturesResponse> {
  const trimmedStopId = stopId.trim();
  const params = new URLSearchParams({
    city,
    stop_id: trimmedStopId,
    limit: String(limit),
  });

  const url =
    typeof window !== "undefined"
      ? `/api/departures?${params}`
      : `${API_URL}/api/${city}/departures?stop_id=${encodeURIComponent(trimmedStopId)}&limit=${limit}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorResponse(response), response.status);
  }

  const data = (await response.json()) as DeparturesResponse;

  if (data.error) {
    throw new ApiError(data.error, 404);
  }

  return data;
}

export async function fetchRouteStats(
  city = "halifax",
): Promise<RouteStatsResponse> {
  const params = new URLSearchParams({ city });

  const url =
    typeof window !== "undefined"
      ? `/api/route-stats?${params}`
      : `${API_URL}/api/${city}/route-stats`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorResponse(response), response.status);
  }

  const data = normalizeRouteStatsResponse(
    (await response.json()) as Record<string, unknown>,
  );

  if (data.error) {
    throw new ApiError(data.error, 404);
  }

  return data;
}

export async function fetchTripPlan(
  city: string,
  fromStop: string,
  toStop: string,
): Promise<TripPlanResponse> {
  const from = fromStop.trim();
  const to = toStop.trim();
  const params = new URLSearchParams({
    city,
    from_stop_id: from,
    to_stop_id: to,
  });

  const response = await fetch(`/api/trip-planner?${params}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorResponse(response), response.status);
  }

  const data = normalizeTripPlanResponse(
    (await response.json()) as Record<string, unknown>,
  );

  if (data.error) {
    throw new ApiError(data.error, 404);
  }

  return data;
}

export { ApiError };