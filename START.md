# 🚀 STLL HAUS - Quick Start Guide

## What's Ready

Your complete STLL HAUS ecommerce website is built and ready to configure!

```
✅ Landing page with hero section
✅ Menu with 4 sample beverages
✅ Shopping cart with persistence
✅ Checkout with Stripe integration
✅ Order confirmation pages
✅ Responsive design
✅ Minimal, calm aesthetic
✅ TypeScript & Tailwind CSS
```

## 1. Set Up Stripe Keys (5 min)

```bash
# Copy template
cp .env.local.example .env.local

# Edit and add your Stripe keys
# Get keys from: https://dashboard.stripe.com/apikeys
```

Edit `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLIC_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Start Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) ✨

## 3. Test Full Flow (2 min)

1. Click "Order Now" on landing
2. Click "Add to cart" on menu items
3. Go to Checkout (cart shows items)
4. Click "Pay with Stripe"
5. Use test card: **`4242 4242 4242 4242`**
   - Expiry: any future date
   - CVC: any 3 digits
6. Complete payment → redirected to success page ✓

## Key Pages

| URL         | What It Is                        |
| ----------- | --------------------------------- |
| `/`         | Landing with hero & STLL meaning  |
| `/menu`     | 4 drinks to order                 |
| `/checkout` | Cart, pickup time, notes, payment |
| `/success`  | Order confirmation                |
| `/cancel`   | If payment cancelled              |

## Customization

### Add/Edit Drinks

Edit `data/menu-items.ts`:

```typescript
{
  id: "new-drink",
  name: "Your Drink Name",
  description: "Description here",
  price: 7.50,
}
```

### Change Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  "stll-cream": "#F7F5F2",    // Main background
  "stll-charcoal": "#2F2F2F", // Text
  "stll-accent": "#C6A27E",   // Buttons
  // ... etc
}
```

### Modify Navbar Links

Edit `components/Navbar.tsx` - `navItems` array

## Available Commands

```bash
npm run dev      # 🚀 Start development server
npm run build    # 🏗️  Build for production
npm run lint     # 🔍 Check code style
npm start        # ▶️  Run production build
```

## Architecture

```
Components (Reusable UI)
├── Button.tsx
├── Card.tsx
├── Navbar.tsx
├── Footer.tsx
├── Cart.tsx
└── CartContext.tsx (State management)

Pages (Routes)
├── / (landing)
├── /menu (drinks)
├── /checkout (cart)
├── /success (confirmation)
└── /cancel (cancellation)

API
└── /api/checkout (Stripe session)

Data & Lib
├── data/menu-items.ts
├── lib/stripe.ts (server)
└── lib/stripe-client.ts (browser)
```

## Important Files

| File                         | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `.env.local`                 | Stripe keys (create from `.env.local.example`) |
| `tailwind.config.ts`         | Custom colors & design tokens                  |
| `components/CartContext.tsx` | Cart state + localStorage                      |
| `data/menu-items.ts`         | Menu data                                      |
| `app/api/checkout/route.ts`  | Stripe Checkout API                            |

## Stripe Test Mode

When using test keys (start with `pk_test_` or `sk_test_`):

- ✅ Transactions are fake
- ✅ No real charges
- ✅ Test card always succeeds: `4242 4242 4242 4242`
- ✅ Perfect for development

Switch to live keys later for production.

## Deployment

### To Vercel

```bash
git push origin main
# Go to vercel.com → Import repo
# Add environment variables
# Deploy!
```

**Environment variables to add:**

- `STRIPE_SECRET_KEY` (live key)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live key)
- `NEXT_PUBLIC_APP_URL` (your Vercel domain)

### To Other Platforms

The project is standard Next.js and works on any platform that supports Node.js.

## Troubleshooting

**"Stripe is undefined"**

- Check `.env.local` exists with Stripe keys
- Restart dev server after adding keys

**Checkout page is empty**

- Add items from `/menu` first (cart is empty by default)

**Test payment doesn't work**

- Verify you're using test card: `4242 4242 4242 4242`
- Check browser console for errors
- Ensure Stripe keys are valid

**Build errors**

- Run `npm install` to ensure all packages installed
- Check Node.js version (18+)

## Next Steps

1. ✅ Get Stripe keys & set `.env.local`
2. ✅ Run `npm run dev`
3. ✅ Test the checkout flow
4. ✅ Customize drinks, colors, text
5. ✅ Add your images to `/public`
6. ✅ Deploy to Vercel or your host

## Resources

- 📖 [Stripe Documentation](https://stripe.com/docs)
- 📖 [Next.js Documentation](https://nextjs.org/docs)
- 📖 [Tailwind CSS](https://tailwindcss.com/docs)
- 🎨 [Brand Colors](./README.md#color-palette)

---

**Questions?** Check `README.md` for full documentation.

**Ready?** → `npm run dev` 🚀
