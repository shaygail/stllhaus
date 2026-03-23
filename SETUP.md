## STLL HAUS - Setup Complete ✓

Your minimal, calm beverage ecommerce site is ready to develop!

### 📁 What Was Created

✅ Next.js 16 project with TypeScript & Tailwind CSS  
✅ Full UI component library (Button, Card, Navbar, Footer)  
✅ Cart management with React Context + localStorage  
✅ Stripe Checkout integration (API route ready)  
✅ 5 pages: Landing, Menu, Checkout, Success, Cancel  
✅ Custom color palette matching STLL HAUS brand  
✅ Responsive design with soft animations

### 🚀 Next Steps

1. **Set up Stripe Keys** (required for checkout)

   ```bash
   # Copy example to .env.local
   cp .env.local.example .env.local

   # Get keys from https://dashboard.stripe.com/apikeys
   # Edit .env.local and add your Stripe keys
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

   Then open [http://localhost:3000](http://localhost:3000)

3. **Test the Flow**
   - Browse landing page
   - Add items from `/menu`
   - Go to `/checkout`
   - Click "Pay with Stripe"
   - Use test card: `4242 4242 4242 4242`

### 📦 Components Created

| Component         | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| `Button.tsx`      | Reusable accent button with link/action support |
| `Card.tsx`        | Soft card container with light background       |
| `Navbar.tsx`      | Sticky header with cart count                   |
| `Footer.tsx`      | Social links footer                             |
| `Cart.tsx`        | Full cart UI with Stripe checkout               |
| `CartContext.tsx` | State management + localStorage                 |

### 📄 Pages Created

| Route       | File                    | Purpose                          |
| ----------- | ----------------------- | -------------------------------- |
| `/`         | `app/page.tsx`          | Landing with hero & STLL meaning |
| `/menu`     | `app/menu/page.tsx`     | 4 drinks with add-to-cart        |
| `/checkout` | `app/checkout/page.tsx` | Cart display & Stripe            |
| `/success`  | `app/success/page.tsx`  | Order confirmation               |
| `/cancel`   | `app/cancel/page.tsx`   | Cancellation message             |

### 🎨 Color Palette

All Tailwind colors are pre-configured:

- `bg-stll-cream` - Main background (#F7F5F2)
- `text-stll-charcoal` - Primary text (#2F2F2F)
- `text-stll-muted` - Secondary text (#7A7A7A)
- `bg-stll-accent` - Buttons (#C6A27E)
- `bg-stll-light` - Cards (#E8DED6)
- `bg-stll-sage` - Highlights (#A3B18A)

### 💳 Stripe Integration

API route ready at `/api/checkout`:

- Accepts cart items, pickup time, notes
- Creates Stripe Checkout session
- Redirects to `/success` or `/cancel`

### 📝 Key Files to Know

```
/app
  /api/checkout/route.ts    ← Stripe session creation
  page.tsx                   ← Landing page
  layout.tsx                 ← Root layout with providers

/components
  CartContext.tsx            ← Cart state (use useCart() hook)

/data
  menu-items.ts              ← Edit to add/update drinks

/lib
  stripe.ts                  ← Server Stripe client
  stripe-client.ts           ← Browser Stripe loader

tailwind.config.ts           ← Custom colors defined here
```

### ⚙️ Environment Variables

Create `.env.local` with:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 📦 Installed Packages

Core:

- `next@16.2.0`
- `react@19.2.4`
- `tailwindcss@4`
- `typescript@5`

Payment:

- `stripe` (server SDK)
- `@stripe/stripe-js` (client SDK)

Dev:

- `eslint`
- `@tailwindcss/postcss`

### 🔧 Available Scripts

```bash
npm run dev      # Start dev server on :3000
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Run ESLint
```

### ❓ Troubleshooting

**"Missing STRIPE_SECRET_KEY"**

- Copy `.env.local.example` to `.env.local`
- Add your real Stripe keys
- Restart dev server

**Checkout redirects to error**

- Verify keys are test keys (start with `pk_test_` or `sk_test_`)
- Check `NEXT_PUBLIC_APP_URL` matches your domain
- Check browser console for errors

**Cart not persisting**

- Check browser allows localStorage
- Open DevTools > Application > Local Storage > `stll-cart`

### 📖 Helpful Links

- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

---

**Ready to customize?** Edit `/data/menu-items.ts` to add your own beverages!
