export interface Departure {
  route_number: string;
  destination: string;
  departure_time: string;
  minutes_until_departure?: number;
  vehicle_id?: string | null;
  is_live: boolean;
  headsign?: string;
}

export interface DeparturesResponse {
  city: string;
  stop_id: string;
  count?: number;
  data_mode?: string;
  updated_at?: number;
  departures: Departure[];
  error?: string;
}

export interface RouteStat {
  route: string;
  route_name?: string;
  buses?: number;
  speed?: number;
  on_time?: number;
  delay?: number;
  cancelled?: number;
}

export interface RouteStatsSummary {
  buses_now?: number;
  cancelled_today?: number;
  routes_active?: number;
  total_routes?: number;
}

export interface RouteStatsResponse {
  city: string;
  count?: number;
  generated_at?: number;
  routes: RouteStat[];
  summary?: RouteStatsSummary;
  error?: string;
}

export interface TripPlanStep {
  step_number: number;
  type: "bus" | "transfer" | "walk";
  route_number?: string;
  destination?: string;
  from_stop: string;
  to_stop: string;
  departure_time?: string;
  arrival_time?: string;
  duration_minutes?: number;
  instructions?: string;
}

export interface TripPlanResponse {
  city: string;
  from_stop: string;
  to_stop: string;
  total_duration_minutes?: number;
  transfers?: number;
  steps: TripPlanStep[];
  simulated?: boolean;
  error?: string;
}