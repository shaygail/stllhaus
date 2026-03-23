// POS integration for order posting

export async function sendOrderToPOS({ items, subtotal, payment_method }) {
  // Map items to POS format: [{ product_id, quantity }]
  const posItems = items.map((item) => ({
    product_id: parseInt(item.id, 10) || item.id, // fallback if not numeric
    quantity: item.quantity,
  }));

  const payload = {
    items: posItems,
    subtotal,
    payment_method,
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
