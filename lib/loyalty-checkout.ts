export type LoyaltyRewardChoice = "use" | "keep";

export type LoyaltyCheckoutCartLine = {
  name: string;
  price: number;
  quantity: number;
  description?: string;
};

export type LoyaltyCheckoutLine = {
  name: string;
  quantity: number;
  price: number;
  description?: string;
};

export type LoyaltyCheckoutPricing = {
  cartSubtotal: number;
  loyaltyDiscount: number;
  discountLines: LoyaltyCheckoutLine[];
  orderTotal: number;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Apply milestone rewards to cart subtotal; delivery fee is added after discounts. */
export function computeLoyaltyCheckoutPricing({
  cart,
  deliveryFee,
  useTenPercent,
  useFreeDrink,
}: {
  cart: LoyaltyCheckoutCartLine[];
  deliveryFee: number;
  useTenPercent: boolean;
  useFreeDrink: boolean;
}): LoyaltyCheckoutPricing {
  const cartSubtotal = roundMoney(cart.reduce((sum, line) => sum + line.price * line.quantity, 0));
  const discountLines: LoyaltyCheckoutLine[] = [];
  let loyaltyDiscount = 0;
  let remaining = cartSubtotal;

  if (useTenPercent && remaining > 0) {
    const amount = roundMoney(remaining * 0.1);
    if (amount > 0) {
      loyaltyDiscount += amount;
      remaining = roundMoney(remaining - amount);
      discountLines.push({
        name: "Loyalty reward: 10% off",
        quantity: 1,
        price: -amount,
        description: "Member milestone reward",
      });
    }
  }

  if (useFreeDrink && cart.length > 0 && remaining > 0) {
    const maxUnit = Math.max(...cart.map((line) => line.price));
    const amount = roundMoney(Math.min(maxUnit, remaining));
    if (amount > 0) {
      loyaltyDiscount += amount;
      discountLines.push({
        name: "Loyalty reward: Free drink",
        quantity: 1,
        price: -amount,
        description: "One drink (up to highest-priced item in cart)",
      });
    }
  }

  const orderTotal = roundMoney(Math.max(0, cartSubtotal + deliveryFee - loyaltyDiscount));

  return {
    cartSubtotal,
    loyaltyDiscount: roundMoney(loyaltyDiscount),
    discountLines,
    orderTotal,
  };
}
