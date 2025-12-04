import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Map frontend `id` to backend expected `id`
    const params = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    // Call backend API
    const res = await fetch(
      "https://liquiditybars.com/canada/backend/admin/api/updateProfile/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const text = await res.text();

    // Try parsing JSON; fallback if backend sends HTML error
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { status: 0, message: "Invalid JSON from server", raw: text };
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy failed:", error);
    return NextResponse.json(
      { status: 0, message: "Proxy failed", error: error.message },
      { status: 500 }
    );
  }
}
