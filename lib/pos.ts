// POS integration for order posting

type POSItem = { id: string | number; quantity: number };
type SendOrderToPOSParams = {
  items: POSItem[];
  subtotal: number;
  payment_method: string;
  customer_name?: string;
};

export async function sendOrderToPOS({ items, subtotal, payment_method, customer_name }: SendOrderToPOSParams) {
  // Map items to POS format: [{ product_id, quantity }]
  const posItems = items.map((item: POSItem) => ({
    product_id: typeof item.id === 'string' && !isNaN(Number(item.id)) ? parseInt(item.id, 10) : item.id,
    quantity: item.quantity,
  }));

  const payload = {
    items: posItems,
    subtotal,
    payment_method,
    customer_name: customer_name || "",
  };

  const POS_URL = process.env.POS_API_URL || "http://localhost:8000/orders/";

  try {
    const res = await fetch(POS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`POS error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("Failed to send order to POS:", err);
    return null;
  }
}
