import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.mobile) {
      return NextResponse.json(
        { success: false, message: "Mobile number is required." },
        { status: 400 }
      );
    }

    // Convert JSON to URL-encoded form data (your backend expects this)
    const formBody = new URLSearchParams({
      mobile: body.mobile, // e.g. +15555555555
    }).toString();

    // Send request to your backend
    const apiResponse = await fetch(
      "https://liquiditybars.com/canada/backend/admin/api/loginWithOtp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      }
    );

    const data = await apiResponse.json();

    return NextResponse.json(data, { status: apiResponse.status });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
