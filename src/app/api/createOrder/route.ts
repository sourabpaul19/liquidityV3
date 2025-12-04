import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const form = new FormData();
    form.append("user_id", body.user_id);
    form.append("device_id", body.device_id);
    form.append("pickup_location", body.pickup_location);
    form.append("total_amount", body.total_amount);
    form.append("tips_amount", body.tips_amount);
    form.append("payment_method", body.payment_method);

    body.cart_items.forEach((item, index) => {
      form.append(`cart_items[${index}][product_id]`, item.product_id);
      form.append(`cart_items[${index}][quantity]`, item.quantity);
      form.append(`cart_items[${index}][price]`, item.price);
      form.append(
        `cart_items[${index}][mixer_id]`,
        item.mixer_id ? item.mixer_id : ""
      );
      form.append(
        `cart_items[${index}][addon_id]`,
        item.addon_id ? item.addon_id : ""
      );
    });

    const response = await fetch(
      "https://liquiditybars.com/canada/backend/admin/api/createOrder/",
      {
        method: "POST",
        body: form, // multipart/form-data (auto-generated)
      }
    );

    const text = await response.text();

    // If backend returned HTML, stop JSON parsing error
    if (text.startsWith("<")) {
      return NextResponse.json(
        {
          status: 0,
          message: "Proxy failed: backend returned HTML error",
          raw: text.substring(0, 500),
        },
        { status: 500 }
      );
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
  console.error("Proxy error:", err);

  const message =
    err instanceof Error ? err.message : "Unknown error occurred";

  return NextResponse.json({
    status: 0,
    message: "Proxy failed",
    error: message,
  });
}
}
