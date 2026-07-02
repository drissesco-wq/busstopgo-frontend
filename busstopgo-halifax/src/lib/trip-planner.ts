import type { DeparturesResponse, TripPlanResponse, TripPlanStep } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://5.161.181.78";

const ESTIMATED_TRAVEL_MINUTES = 25;
const TRANSFER_BUFFER_MINUTES = 8;

async function fetchDeparturesDirect(
  city: string,
  stopId: string,
  limit = 10,
): Promise<DeparturesResponse> {
  const response = await fetch(
    `${API_URL}/api/${city}/departures?stop_id=${encodeURIComponent(stopId)}&limit=${limit}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Could not load departures for stop ${stopId}`);
  }

  const data = (await response.json()) as DeparturesResponse;
  if (data.error) throw new Error(data.error);
  return data;
}

function addMinutesToTime(time: string, minutes: number): string | undefined {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return undefined;
  const total = Number(match[1]) * 60 + Number(match[2]) + minutes;
  const hours = Math.floor(total / 60) % 24;
  const mins = total % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}`;
}

export async function simulateTripPlan(
  city: string,
  fromStop: string,
  toStop: string,
): Promise<TripPlanResponse> {
  const [fromData, toData] = await Promise.all([
    fetchDeparturesDirect(city, fromStop, 10),
    fetchDeparturesDirect(city, toStop, 10),
  ]);

  if (!fromData.departures.length) {
    throw new Error("No buses departing from the origin stop.");
  }

  const toRoutes = new Set(toData.departures.map((d) => d.route_number));
  const directDeparture = fromData.departures.find((d) =>
    toRoutes.has(d.route_number),
  );

  if (directDeparture) {
    const wait = directDeparture.minutes_until_departure ?? 0;
    const total = wait + ESTIMATED_TRAVEL_MINUTES;

    const steps: TripPlanStep[] = [
      {
        step_number: 1,
        type: "bus",
        route_number: directDeparture.route_number,
        destination: directDeparture.destination,
        from_stop: fromStop,
        to_stop: toStop,
        departure_time: directDeparture.departure_time,
        arrival_time: addMinutesToTime(
          directDeparture.departure_time,
          ESTIMATED_TRAVEL_MINUTES,
        ),
        duration_minutes: ESTIMATED_TRAVEL_MINUTES,
        instructions: `Take Route ${directDeparture.route_number} toward ${directDeparture.destination}`,
      },
    ];

    return {
      city,
      from_stop: fromStop,
      to_stop: toStop,
      total_duration_minutes: total,
      transfers: 0,
      steps,
      simulated: true,
    };
  }

  const firstLeg = fromData.departures[0];
  const secondLeg =
    toData.departures.find((d) => d.route_number !== firstLeg.route_number) ??
    toData.departures[0];

  if (!secondLeg) {
    throw new Error("No connecting service found to the destination stop.");
  }

  const wait = firstLeg.minutes_until_departure ?? 0;
  const firstLegDuration = Math.max(12, Math.floor(ESTIMATED_TRAVEL_MINUTES * 0.6));
  const transferArrival = addMinutesToTime(firstLeg.departure_time, firstLegDuration);
  const secondWait = secondLeg.minutes_until_departure ?? TRANSFER_BUFFER_MINUTES;
  const secondLegDuration = Math.max(10, ESTIMATED_TRAVEL_MINUTES - firstLegDuration);
  const total =
    wait + firstLegDuration + TRANSFER_BUFFER_MINUTES + secondLegDuration;

  const steps: TripPlanStep[] = [
    {
      step_number: 1,
      type: "bus",
      route_number: firstLeg.route_number,
      destination: firstLeg.destination,
      from_stop: fromStop,
      to_stop: "Transfer point",
      departure_time: firstLeg.departure_time,
      arrival_time: transferArrival,
      duration_minutes: firstLegDuration,
      instructions: `Take Route ${firstLeg.route_number} toward ${firstLeg.destination}`,
    },
    {
      step_number: 2,
      type: "transfer",
      from_stop: "Transfer point",
      to_stop: "Transfer point",
      duration_minutes: TRANSFER_BUFFER_MINUTES,
      instructions: "Transfer to connecting route",
    },
    {
      step_number: 3,
      type: "bus",
      route_number: secondLeg.route_number,
      destination: secondLeg.destination,
      from_stop: "Transfer point",
      to_stop: toStop,
      departure_time: secondLeg.departure_time,
      arrival_time: addMinutesToTime(secondLeg.departure_time, secondLegDuration),
      duration_minutes: secondLegDuration,
      instructions: `Take Route ${secondLeg.route_number} toward ${secondLeg.destination}`,
    },
  ];

  return {
    city,
    from_stop: fromStop,
    to_stop: toStop,
    total_duration_minutes: total,
    transfers: 1,
    steps,
    simulated: true,
  };
}

export function normalizeTripPlanResponse(
  data: Record<string, unknown>,
): TripPlanResponse {
  const rawSteps = Array.isArray(data.steps)
    ? data.steps
    : Array.isArray(data.legs)
      ? data.legs
      : [];

  return {
    city: String(data.city ?? "halifax"),
    from_stop: String(data.from_stop ?? data.from_stop_id ?? ""),
    to_stop: String(data.to_stop ?? data.to_stop_id ?? ""),
    total_duration_minutes: Number(data.total_duration_minutes ?? data.total_time_minutes) || undefined,
    transfers: Number(data.transfers ?? data.transfer_count) || 0,
    simulated: Boolean(data.simulated),
    steps: rawSteps.map((step, index) => {
      const raw = step as Record<string, unknown>;
      return {
        step_number: Number(raw.step_number ?? index + 1),
        type: (raw.type as TripPlanStep["type"]) ?? "bus",
        route_number: raw.route_number
          ? String(raw.route_number)
          : raw.route
            ? String(raw.route)
            : undefined,
        destination: raw.destination ? String(raw.destination) : undefined,
        from_stop: String(raw.from_stop ?? raw.from_stop_id ?? ""),
        to_stop: String(raw.to_stop ?? raw.to_stop_id ?? ""),
        departure_time: raw.departure_time ? String(raw.departure_time) : undefined,
        arrival_time: raw.arrival_time ? String(raw.arrival_time) : undefined,
        duration_minutes: Number(raw.duration_minutes) || undefined,
        instructions: raw.instructions ? String(raw.instructions) : undefined,
      };
    }),
    error: data.error ? String(data.error) : undefined,
  };
}