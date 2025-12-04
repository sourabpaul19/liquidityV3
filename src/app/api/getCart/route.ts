// app/api/getCartDetailsForUser/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, device_id } = body;

    const formData = new URLSearchParams(body);
    formData.append("user_id", user_id);
    formData.append("device_id", device_id);

    const apiResponse = await fetch(
      "https://liquiditybars.com/canada/backend/admin/api/getCartDetailsForUser/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formData.toString(),
        cache: "no-store",
      }
    );

    const text = await apiResponse.text();
    console.log("getCart response:", text);

    if (!apiResponse.ok || text.trim().startsWith("<")) {
      return NextResponse.json(
        {
          status: 0,
          message: "Proxy failed: Liquidity API returned HTML instead of JSON",
          raw: text,
        },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          status: 0,
          message: "Invalid JSON from backend",
          raw: text,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        status: 0,
        message: "Proxy failed",
        error: message,
      },
      { status: 500 }
    );
  }
}
