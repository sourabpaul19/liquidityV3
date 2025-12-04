import { NextRequest, NextResponse } from "next/server";

const cartDB: { id: string; quantity: number }[] = [];

export async function POST(req: NextRequest) {
  try {
    // Safe JSON parsing
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { status: "0", message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Validate body is object
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { status: "0", message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { itemId, quantity } = body as {
      itemId?: string;
      quantity?: number | string;
    };

    const quantityNum = Number(quantity);

    if (!itemId || isNaN(quantityNum) || quantityNum < 0) {
      return NextResponse.json(
        { status: "0", message: "Invalid itemId or quantity" },
        { status: 400 }
      );
    }

    // UPDATE in cartDB
    const index = cartDB.findIndex((i) => i.id === itemId);

    if (index > -1) {
      cartDB[index].quantity = quantityNum;
    } else {
      cartDB.push({ id: itemId, quantity: quantityNum });
    }

    return NextResponse.json(
      { status: "1", message: "Cart updated", cartDB },
      { status: 200 }
    );

  } catch (err: unknown) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json(
      { status: "0", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
