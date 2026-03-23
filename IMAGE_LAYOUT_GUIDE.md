# Image-Based Layout Guide

## New Components Created

### 1. **HeroImage**

Full-width hero sections with background images, overlay text, and parallax effects.

```tsx
<HeroImage
  src="/images/hero.jpg"
  alt="Hero"
  title="Your Title"
  subtitle="Your subtitle"
/>
```

### 2. **SplitSection**

Text on one side, image on the other - perfect for storytelling.

```tsx
<SplitSection
  imageSrc="/images/product.jpg"
  imageAlt="Product"
  imagePosition="right" // or "left"
  backgroundColor="bg-stll-cream"
>
  <h3>Your heading</h3>
  <p>Your content here</p>
</SplitSection>
```

### 3. **ProductShowcase**

Grid of products with images, titles, and descriptions.

```tsx
<ProductShowcase
  columns={3} // 2, 3, or 4
  gap="md" // sm, md, lg
  items={[
    {
      id: "1",
      src: "/images/product1.jpg",
      alt: "Product 1",
      title: "Matcha Latte",
      description: "Smooth and creamy",
    },
  ]}
/>
```

### 4. **ColorBlocks**

Aesthetic color sections for visual breaks.

```tsx
<ColorBlocks
  blocks={[
    { color: "bg-stll-accent" },
    { color: "bg-stll-sage" },
    { color: "bg-stll-light" },
  ]}
/>
```

## How to Add Images

### Step 1: Add Images to Public Folder

Place your images in `/public/images/`:

- Hero images (1200x600 recommended)
- Product images (500x500 recommended)
- Drink images (600x500 recommended)

### Step 2: Update Gallery Page

Edit `/app/gallery/page.tsx` and replace placeholder URLs:

**Before:**

```tsx
src = "/api/placeholder?width=1200&height=600";
```

**After:**

```tsx
src = "/images/your-image.jpg";
```

### Step 3: Image Optimization Tips

- Use Next.js Image component (already built-in)
- Images are automatically optimized
- Use responsive sizes for mobile
- WebP format recommended for better performance

## Gallery Page Location

Visit: `/gallery`

The gallery showcases all new layout components in action!

## Customization

### Colors

Update in `tailwind.config.ts`:

- `stll-cream`: Background
- `stll-accent`: Primary color (tan)
- `stll-sage`: Secondary color (green)
- `stll-light`: Light accent
- `stll-charcoal`: Text color
- `stll-muted`: Secondary text

### Animations

All sections include scroll-reveal animations:

- Fade in as you scroll
- Staggered timing for cascading effect
- Smooth hover effects on images

### Responsive

All components are fully responsive:

- Mobile: Single column
- Tablet: 2 columns
- Desktop: 2-4 columns depending on component
