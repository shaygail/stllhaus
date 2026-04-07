# STLL HAUS - Modern Beverage Ecommerce Platform

A beautifully designed, minimal ecommerce website for STLL HAUS, a premium beverage brand. Built with Next.js 16, React, TypeScript, Tailwind CSS, Stripe checkout, and Supabase-based account loyalty.

## Features

### Core Platform

- 🛍️ **Product Menu** - Browse 4 premium beverage selections
- 🛒 **Smart Shopping Cart** - Add/remove items with persistent storage
- 💳 **Stripe Checkout** - Secure payment processing
- 📦 **Order Management** - Success/cancel confirmation pages
- 🎨 **Custom Design** - Minimal, calm aesthetic with brand colors

### Loyalty Rewards System ⭐

- 💰 **Points Earning** - Earn 10 loyalty points per $1 spent
- 🏆 **Three-Tier Membership** - Bronze → Silver → Gold progression
- 🎁 **Exclusive Benefits** - Tier-specific discounts (10-20% off) and perks
- 📊 **Progress Tracking** - Visual cards showing tier status and advancement
- 👤 **Account-Linked** - Rewards tied to signed-in users
- 🔗 **Seamless Integration** - Automatic point awarding at order success

## Tech Stack

- **Framework**: Next.js 16.2.0 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4
- **Auth + Loyalty Storage**: Supabase Auth (user metadata)
- **Payments**: Stripe API
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Stripe account with test keys

### Installation

```bash
# Clone and install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Stripe keys:
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_SECRET_KEY=sk_test_...

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Testing Payments

Use Stripe test card: `4242 4242 4242 4242`

- Expiry: Any future date
- CVC: Any 3 digits

### Testing Loyalty

1. Visit `/login` and sign in with email magic link
2. Add items to cart and checkout
3. Points are awarded on `/success` page
4. Visit `/account` to view points, tier, and benefits

## Project Structure

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx               # Landing page
├── menu/page.tsx          # Product menu
├── checkout/page.tsx      # Checkout page
├── success/page.tsx       # Order success (awards loyalty points)
├── cancel/page.tsx        # Order cancelled
├── loyalty/page.tsx       # Redirects to /account
├── account/page.tsx       # Account + loyalty dashboard
├── login/page.tsx         # Email magic-link sign in
└── api/checkout/route.ts  # Stripe checkout API

components/
├── Navbar.tsx             # Navigation with account link
├── Footer.tsx             # Footer
├── Button.tsx             # Reusable button component
├── Card.tsx               # Reusable card component
├── Cart.tsx               # Shopping cart display
└── CartContext.tsx        # Cart state management

data/
└── menu-items.ts          # Product menu data
```

## Key Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build optimized bundle
npm start            # Start production server
npm run lint         # Run ESLint
```

## Customization

### Brand Colors

Edit `tailwind.config.ts` to modify the 6-color palette:

- stll-cream, stll-charcoal, stll-muted, stll-accent, stll-light, stll-sage

### Menu Items

Update `data/menu-items.ts` to add/modify beverages

### Loyalty Rewards

Adjust in `lib/loyalty.ts`:

- `POINTS_PER_DOLLAR`: Points earned per dollar (default: 10)
- Tier thresholds in `getLoyaltyTier()`
- Benefits in `getTierBenefits()`

## Documentation

- [START.md](./START.md) - Quick start guide
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [BUILD_COMPLETE.md](./BUILD_COMPLETE.md) - Build completion checklist

## Future Enhancements

- Point redemption system (redeem points for free drinks)
- Email notifications (tier upgrades, special offers)
- Referral program (bonus points for referrals)
- Admin dashboard (loyalty analytics)
- Inventory management
- Order history tracking

## License

Private project for STLL HAUS brand.

## Support

For issues or questions, refer to:

- [Next.js Docs](https://nextjs.org/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
