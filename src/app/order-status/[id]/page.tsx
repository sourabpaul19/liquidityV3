// app/order-status/[id]/page.tsx

import OrderStatusPageClient from "./OrderStatusPageClient";

export default function Page({ params }: { params: { id: string } }) {
  return <OrderStatusPageClient id={params.id} />;
}
