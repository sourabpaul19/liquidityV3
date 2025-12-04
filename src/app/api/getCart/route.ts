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
          "Accept": "application/json",              // 🔥 REQUIRED
        },
        body: formData.toString(),
        cache: "no-store",
      }
    );

    // Raw response
    const text = await apiResponse.text();

    console.log("getCart response:", text);

    // 🔥 If API sends HTML → send clean error
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

    // Safe JSON parse
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return NextResponse.json(
        {
          status: 0,
          message: "Invalid JSON from backend",
          raw: text,
        },
        { status: 500 }
      );
    }

    // Success
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 0,
        message: "Proxy failed",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
