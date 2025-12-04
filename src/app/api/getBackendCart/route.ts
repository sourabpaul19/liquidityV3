// app/api/getBackendCart/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse JSON safely with validation
    const body = await request.json();
    if (!body || !body.user_id || !body.device_id) {
      return NextResponse.json(
        { message: "Missing required fields: user_id and device_id" },
        { status: 400 }
      );
    }

    // Perform backend fetch
    const resp = await fetch(
      "https://liquiditybars.com/canada/backend/admin/api/getCartDetailsForUser/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    // If backend returns error status, return it
    if (!resp.ok) {
      const errorText = await resp.text();
      return NextResponse.json(
        { message: `Backend error: ${resp.status} - ${errorText}` },
        { status: resp.status }
      );
    }

    // Parse backend JSON response
    const data = await resp.json();

    // Sanity check on data before returning
    if (!data) {
      return NextResponse.json(
        { message: "Empty backend response" },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Proxy API Error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
