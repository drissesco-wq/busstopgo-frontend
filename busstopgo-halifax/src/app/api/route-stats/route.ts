import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://5.161.181.78";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city") ?? "halifax";
  const url = `${API_URL}/api/${city}/route-stats`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const body = await response.text();
    let payload: unknown;

    try {
      payload = JSON.parse(body);
    } catch {
      const isHtml = body.trim().startsWith("<");
      payload = {
        error: isHtml
          ? `Route stats unavailable (${response.status})`
          : body || `Request failed (${response.status})`,
      };
    }

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the Halifax backend." },
      { status: 502 },
    );
  }
}