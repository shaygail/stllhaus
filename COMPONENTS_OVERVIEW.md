# New Gallery Components Overview

## 📸 All New Components Created

### 1. **HeroImage** ✨

Full-width hero section with background image and overlay text.

**Location**: `/components/HeroImage.tsx`

**Usage**:

```tsx
<HeroImage
  src="/images/hero-main.jpg"
  alt="Hero"
  title="Our Craft, Our Passion"
  subtitle="Each sip is a moment of mindfulness..."
  darken={true}
/>
```

**Props**:

- `src`: Image path
- `alt`: Alt text
- `title`: Main heading
- `subtitle`: Subheading
- `children`: Additional content
- `overlayContent`: Custom overlay
- `darken`: Darken overlay (true/false)

**Features**:

- Parallax hover effect
- Autoplay animations
- Responsive sizing
- Gradient overlay

---

### 2. **SplitSection** 🎯

Text on one side, image on the other.

**Location**: `/components/SplitSection.tsx`

**Usage**:

```tsx
<SplitSection
  imageSrc="/images/drink.jpg"
  imageAlt="Drink"
  imagePosition="right"
  backgroundColor="bg-stll-cream"
>
  <h3>Today's Mood is Sponsored by Calm</h3>
  <p>Our signature blend captures...</p>
</SplitSection>
```

**Props**:

- `imageSrc`: Image path
- `imageAlt`: Alt text
- `imagePosition`: "left" or "right"
- `backgroundColor`: BG color class
- `children`: Text content

**Features**:

- Responsive layout
- Hover zoom on image
- Flexible content area
- Smooth transitions

---

### 3. **ProductShowcase** 🛍️

Grid of products with images and descriptions.

**Location**: `/components/ProductShowcase.tsx`

**Usage**:

```tsx
<ProductShowcase
  columns={3}
  gap="md"
  items={[
    {
      id: "1",
      src: "/images/matcha.jpg",
      alt: "Matcha",
      title: "Cloudy Matcha",
      description: "Smooth, earthy, intentional",
    },
    // More items...
  ]}
/>
```

**Props**:

- `items`: Array of products
- `columns`: 2, 3, or 4 columns
- `gap`: "sm", "md", or "lg"

**Item Properties**:

- `id`: Unique identifier
- `src`: Image path
- `alt`: Alt text
- `title`: Product name
- `description`: Short description

**Features**:

- Responsive grid
- Hover zoom effect
- Gradient text on hover
- Staggered animations

---

### 4. **ColorBlocks** 🎨

Aesthetic colored sections for visual breaks.

**Location**: `/components/ColorBlocks.tsx`

**Usage**:

```tsx
<ColorBlocks
  blocks={[
    { color: "bg-stll-accent" },
    { color: "bg-stll-sage" },
    { color: "bg-stll-light" },
  ]}
  orientation="horizontal"
/>
```

**Props**:

- `blocks`: Array of color objects
- `orientation`: "horizontal" or "vertical"

**Block Properties**:

- `color`: Tailwind color class
- `height`: Optional height

**Features**:

- Flex growing on hover
- Color blocks
- Visual breaks

---

### 5. **BrandSection** 🏢

Brand identity/story sections with text and image.

**Location**: `/components/BrandSection.tsx`

**Usage**:

```tsx
<BrandSection
  label="OU"
  title="BRAND IDENTITY"
  description="Specialty coffee shop with large selection..."
  imageSrc="/images/brand.jpg"
  imageAlt="Brand"
  isDark={false}
/>
```

**Props**:

- `label`: Section label (short code)
- `title`: Main title
- `description`: Content text
- `imageSrc`: Optional image
- `imageAlt`: Alt text
- `backgroundColor`: BG color class
- `isDark`: Dark theme

**Features**:

- Professional layout
- Flexible content
- Optional image
- Dark/light themes

---

## 📍 Where to Find Components

### Gallery Page Layout

**URL**: `/gallery`
**File**: `/app/gallery/page.tsx`

This page showcases all components in action!

---

## 🎨 Customization Guide

### Colors Available

```
stll-cream      // #F7F5F2 - Cream background
stll-charcoal   // #2F2F2F - Dark text
stll-muted      // #7A7A7A - Gray text
stll-accent     // #C6A27E - Tan/brown
stll-light      // #E8DED6 - Light tan
stll-sage       // #A3B18A - Sage green
```

### Background Colors

```tsx
backgroundColor = "bg-white";
backgroundColor = "bg-stll-cream";
backgroundColor = "bg-stll-cream/50";
backgroundColor =
  "bg-gradient-to-br from-stll-cream/50 via-white to-stll-cream/30";
```

### Animation Classes

- `animate-fadeIn` - Fade in
- `animate-slideUp` - Slide up
- `animate-slideDown` - Slide down
- `animate-scaleIn` - Scale in
- `scroll-reveal` - Scroll reveal

---

## 📱 Responsive Breakpoints

- **Mobile**: Single column (default)
- **Tablet** (md): 2 columns
- **Desktop** (lg+): Full responsive

All components are mobile-first designed!

---

## 🚀 Getting Started

### Step 1: Add Images

1. Create `/public/images` folder
2. Add your product images
3. See `IMAGE_SETUP.md` for specifications

### Step 2: Update Gallery Page

Edit `/app/gallery/page.tsx`:

- Replace placeholder image URLs
- Update product showcase items
- Customize text content

### Step 3: Customize Components

Each component is flexible and can be styled with:

- Tailwind classes
- Custom colors
- Different layouts
- Custom animations

### Step 4: Deploy

Everything is optimized and ready:

- ✅ Next.js Image optimization
- ✅ Responsive design
- ✅ Performance optimized
- ✅ SEO friendly

---

## 💡 Pro Tips

### For Best Results

1. Use high-quality images (2x resolution)
2. Keep consistent aspect ratios
3. Maintain color palette consistency
4. Test on mobile devices
5. Load test images (~200KB each)

### Performance

- Images are lazy-loaded
- Automatic format optimization
- Responsive sizing
- CDN-ready

### Accessibility

- Alt text on all images
- Semantic HTML
- Keyboard navigation
- ARIA labels

---

## 📚 Related Files

- `IMAGE_SETUP.md` - Image setup instructions
- `IMAGE_LAYOUT_GUIDE.md` - Detailed component guide
- `/app/gallery/page.tsx` - Gallery page example
- `/components/HeroImage.tsx` - Hero component
- `/components/SplitSection.tsx` - Split component
- `/components/ProductShowcase.tsx` - Showcase component
- `/components/ColorBlocks.tsx` - Color blocks
- `/components/BrandSection.tsx` - Brand section

---

## 🎓 Learning Resources

### Next.js Image Component

- Automatic optimization
- Responsive sizing
- Format conversion
- Lazy loading

### Tailwind CSS

- Responsive classes (md:, lg:)
- Gradient utilities
- Animation classes
- Spacing system

### CSS Animations

- Smooth transitions
- Scroll reveals
- Hover effects
- Transform properties

---

## 🆘 Troubleshooting

### Images Not Showing

1. Check path is correct: `/images/filename.jpg`
2. Ensure image exists in `/public/images/`
3. Clear cache and rebuild
4. Check image format (JPG, PNG, WebP)

### Layout Issues

1. Check responsive breakpoints
2. Verify Tailwind classes
3. Check mobile vs desktop
4. Inspect in DevTools

### Animation Issues

1. Clear browser cache
2. Check animation class names
3. Verify CSS loads
4. Check scroll-reveal classes

---

## ❓ Questions?

Refer to:

- Component usage examples above
- Individual component files
- Gallery page implementation
- IMAGE_SETUP.md documentation
