import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://5.161.181.78";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city") ?? "halifax";
  const stopId = request.nextUrl.searchParams.get("stop_id");
  const limit = request.nextUrl.searchParams.get("limit") ?? "10";

  if (!stopId?.trim()) {
    return NextResponse.json(
      { error: "stop_id is required" },
      { status: 400 },
    );
  }

  const url = `${API_URL}/api/${city}/departures?stop_id=${encodeURIComponent(stopId.trim())}&limit=${limit}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const body = await response.text();
    let payload: unknown = body;

    try {
      payload = JSON.parse(body);
    } catch {
      payload = { error: body || `Request failed (${response.status})` };
    }

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the Halifax backend." },
      { status: 502 },
    );
  }
}