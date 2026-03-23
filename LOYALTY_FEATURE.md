# STLL HAUS Loyalty Card Feature

## Overview

The loyalty card system rewards customers with points for every purchase, with a three-tier membership system (Bronze, Silver, Gold) that unlocks exclusive benefits.

## How It Works

### Points Earning

- Customers earn **10 loyalty points** for every $1 spent
- Points are automatically awarded after a successful purchase
- Points are tracked and persisted in the customer's loyalty card

### Tier System

| Tier       | Points  | Discount | Benefits                   |
| ---------- | ------- | -------- | -------------------------- |
| **Bronze** | 0-249   | -        | Join the program           |
| **Silver** | 250-499 | 10% off  | Exclusive menu items       |
| **Gold**   | 500+    | 20% off  | Free drink every 50 points |

### Loyalty Card Data

Each loyalty card stores:

- `customerId`: Unique identifier (UUID)
- `name`: Customer name
- `email`: Customer email
- `totalPoints`: Accumulated loyalty points
- `totalPurchases`: Number of purchases made
- `totalSpent`: Total amount spent
- `tier`: Current tier (bronze, silver, gold)
- `joinedAt`: Date joined
- `lastPurchase`: Date of last purchase

## Features

### 1. Sign Up

- Customers can sign up on `/loyalty` page
- Required fields: Name and email
- Immediately creates a loyalty card and starts earning points

### 2. Loyalty Card Display

- Shows current points balance
- Displays current tier with icon (🥉 🥈 🥇)
- Progress bar showing points needed to reach next tier
- Lists tier-specific benefits
- Shows member statistics (joined date, total purchases, total spent)

### 3. Points Preview

- Cart component shows estimated points earned before checkout
- Visual feedback with sage-green badge
- Calculated as: `Math.floor(total * 10)`

### 4. Automatic Points Award

- After successful payment on `/success` page
- `SuccessHandler` component automatically:
  - Calculates points earned
  - Updates loyalty card
  - Clears shopping cart
- User sees confirmation message

### 5. Navigation Integration

- Navbar shows loyalty badge with current points when member
- Badge color matches brand aesthetic (stll-sage)
- Badge links to loyalty card page

## File Structure

```
components/
├── LoyaltyContext.tsx         # State management & business logic
├── LoyaltyCardDisplay.tsx     # Card visual component
├── SuccessHandler.tsx         # Awards points on purchase success
│
app/
├── loyalty/
│   └── page.tsx              # Loyalty program page
├── success/
│   └── page.tsx              # Updated with points message + link
└── layout.tsx                # Includes LoyaltyProvider wrapper
```

## Implementation Details

### LoyaltyContext.tsx

- React Context for global loyalty state
- Custom `useLoyalty()` hook for component access
- localStorage persistence (key: "stll-loyalty-card")
- Methods:
  - `initializeCard(name, email)`: Create new loyalty card
  - `addPoints(pointsEarned, purchaseAmount)`: Award points and update tier
  - `getTierBenefits()`: Get current tier benefits
  - `getPointsUntilNextTier()`: Calculate progress to next tier
  - `determineTier()`: Calculate tier based on points

### LoyaltyCardDisplay.tsx

- Responsive card component
- Gradient background by tier
- Progress visualization
- Benefits listing
- Member statistics

### SuccessHandler.tsx

- Client-side effect that runs on `/success` page load
- Awards loyalty points when:
  - Customer is a loyalty member
  - Cart contains items
- Clears cart after successful purchase

## Color Scheme

- Loyalty accent color: `stll-sage` (#A3B18A)
- Tier backgrounds:
  - Bronze: Amber gradient
  - Silver: Slate gradient
  - Gold: Yellow gradient

## Future Enhancement Ideas

1. **Point Redemption**
   - Allow customers to redeem 100 points for free drink
   - Track redemption history

2. **Email Notifications**
   - Send tier upgrade notifications
   - Birthday bonus points
   - Exclusive offers for members

3. **Referral Program**
   - Bonus points for referring friends
   - Track referral history

4. **Special Promotions**
   - Double points on specific products
   - Seasonal promotions

5. **Analytics Dashboard**
   - Admin view of loyalty member metrics
   - Points distribution analytics

## Testing the Feature

### Sign Up

1. Navigate to `/loyalty`
2. Fill in name and email
3. Submit form
4. Card appears with starting 0 points

### Earn Points

1. Add items to cart
2. View cart to see estimated points
3. Complete checkout (use test Stripe card)
4. See points awarded on success page
5. Navigate to loyalty card to confirm points

### Tier Progression

1. Make multiple purchases to accumulate points
2. At 250 points: Bronze → Silver tier
3. At 500 points: Silver → Gold tier
4. Loyalty card updates automatically

## Testing in Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test card: 4242 4242 4242 4242
# Exp: Any future date
# CVC: Any 3 digits
```

Visit `http://localhost:3000/loyalty` to test the loyalty feature.
