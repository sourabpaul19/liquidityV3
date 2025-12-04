import { NextRequest, NextResponse } from "next/server";

// Example: using a mock database (replace with your actual DB logic)
let cartDB: { id: string; quantity: number }[] = []; // your cart items

export async function POST(req: NextRequest) {
  try {
    const { itemId, quantity } = await req.json();

    if (!itemId || typeof quantity !== "number") {
      return NextResponse.json(
        { status: "0", message: "Invalid data" },
        { status: 400 }
      );
    }

    // Example: update item in "cartDB"
    const itemIndex = cartDB.findIndex((i) => i.id === itemId);
    if (itemIndex > -1) {
      cartDB[itemIndex].quantity = quantity;
    } else {
      // if item not found, add it
      cartDB.push({ id: itemId, quantity });
    }

    return NextResponse.json({ status: "1", message: "Cart updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { status: "0", message: "Server error" },
      { status: 500 }
    );
  }
}
