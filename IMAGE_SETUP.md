# Image Setup Instructions

## Directory Structure

Create this folder structure in your project root:

```
public/
├── images/
│   ├── hero-main.jpg           (1200x600) - Main hero image
│   ├── product-matcha.jpg      (500x500) - Matcha product
│   ├── product-ube.jpg         (500x500) - Ube product
│   ├── product-coconut.jpg     (500x500) - Coconut product
│   ├── featured-drink.jpg      (600x500) - Featured split section
│   ├── stll-experience.jpg     (600x500) - Experience split section
│   └── gallery/
│       ├── drink-1.jpg
│       ├── drink-2.jpg
│       └── ...
```

## Image Specifications

### Hero Images

- **Dimensions**: 1200px × 600px (minimum)
- **Best for**: Full-width header sections
- **Format**: JPG or WebP
- **File size**: 200-400KB

### Product Images

- **Dimensions**: 500px × 500px
- **Best for**: Product grid showcases
- **Format**: JPG or WebP
- **File size**: 100-200KB

### Split Section Images

- **Dimensions**: 600px × 500px
- **Best for**: Text + Image layouts
- **Format**: JPG or WebP
- **File size**: 150-250KB

## Image Optimization

The Project uses Next.js Image component which automatically:

- ✅ Optimizes format (WebP, modern formats)
- ✅ Lazy loads images
- ✅ Responsive sizing
- ✅ Caching

## File Upload Process

1. **Create the images folder**:

   ```bash
   mkdir -p public/images
   ```

2. **Add your images** to `public/images/`

3. **Update component imports**:
   Replace placeholder URLs with your image paths:

   ```tsx
   // Before
   src = "/api/placeholder?width=1200&height=600";

   // After
   src = "/images/hero-main.jpg";
   ```

## Using Images in Components

### In Gallery Page

Edit `/app/gallery/page.tsx`:

```tsx
<HeroImage
  src="/images/hero-main.jpg"
  alt="STLL HAUS Coffee & Beverage"
  title="Our Craft, Our Passion"
  subtitle="Description here"
/>
```

### In Split Sections

```tsx
<SplitSection imageSrc="/images/featured-drink.jpg" imageAlt="Featured Product">
  <h3>Your heading</h3>
  <p>Your content</p>
</SplitSection>
```

### In Product Showcase

```tsx
<ProductShowcase
  items={[
    {
      id: "1",
      src: "/images/product-matcha.jpg",
      alt: "Matcha Latte",
      title: "Cloudy Matcha",
      description: "Your description",
    },
  ]}
/>
```

## Tips for Best Results

### Lighting

- Use natural lighting
- Avoid harsh shadows
- Think minimalist like the Poort design

### Composition

- Prioritize product in frame
- Leave white space
- Center important elements

### Color Palette

- Align with: Cream, tan, sage green, charcoal
- Avoid clashing colors
- Maintain cohesive aesthetic

### Consistency

- Same props/materials in photos
- Similar backgrounds
- Consistent styling throughout

## Responsive Images

Images automatically scale:

- **Mobile**: Single column, optimized sizing
- **Tablet**: 2-column layout
- **Desktop**: Full responsive layout

## Next Steps

1. ✅ Create `/public/images` folder
2. ✅ Add your images
3. ✅ Update image paths in components
4. ✅ Visit `/gallery` to see results
5. ✅ Customize styling as needed
