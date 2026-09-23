# Implementation Plan: Consistent Padding, Margin, and Spacing Across All Pages

## Goal
Standardize layout spacing (padding, margin, gap) for every page – Home, About, Contact, Portfolio, Services, Team, etc. – ensuring photos, text, and UI elements have harmonious, consistent appearance across desktop and mobile.

## User Review Required
> [!IMPORTANT]
> This plan will modify many JSX files, introduce shared layout components, and adjust Tailwind configuration. Please review the proposed approach and confirm before we proceed.

## Open Questions
> [!WARNING]
> 1. **Spacing Scale** – Do you prefer the default Tailwind spacing (e.g., `p-8`, `gap-6`) or a custom scale such as `p-10`, `gap-8`?
> 2. **Container Width** – Should all sections use `max-w-5xl` (current) or a larger width like `max-w-7xl`?
> 3. **Mobile Spacing** – Any specific vertical spacing adjustments for mobile (e.g., larger top/bottom padding on small screens)?
> 4. **Image Aspect Ratio** – Enforce a uniform aspect ratio for hero and gallery images (e.g., `aspect-[4/3]`)?
> 5. **Design Tokens** – Would you like a CSS custom properties file for spacing values to enable future tweaks without code changes?

## Proposed Changes
### 1. Shared Layout Components
- **`src/components/layout/Section.tsx`** – wrapper applying `container mx-auto px-4 md:px-6 py-12 md:py-16` with optional background prop.
- **`src/components/layout/Container.tsx`** – enforces `max-w-5xl` (or chosen width) and centers content.
- **`src/components/ui/ImageBox.tsx`** – enforces consistent `aspect-[4/3]` (configurable) and `object-cover` styling for all images.

### 2. Tailwind Configuration
- Extend `tailwind.config.js` with a custom spacing scale (e.g., `{2: '0.5rem',4:'1rem',6:'1.5rem',8:'2rem',10:'2.5rem',12:'3rem'}`) and generate utilities like `p-10`, `gap-10`.
- Add a plugin to expose CSS variables for spacing if token file is desired.

### 3. Refactor Pages
- Replace ad‑hoc padding/margin classes (`pt-40`, `pb-20`, `py-24`, etc.) with the new `<Section>` and `<Container>` components.
- Update Hero, About, Contact, Portfolio, Services, Team pages to use the shared components and `ImageBox` for images.
- Ensure all inner elements use the new spacing utilities (`gap-8`, `space-y-6`, `mt-8` → `mt-12` as needed) for a consistent vertical rhythm.

### 4. Component Adjustments
- Adjust **Navbar**, **Footer**, **FloatingWhatsApp** to align with the new spacing tokens.
- Update **Admin Panel** pages to use the same layout components so the editing UI matches the front‑end spacing.

### 5. Verification
- Run `npm run lint` and `npm run build` to ensure TypeScript compiles.
- Start dev server and visually inspect each page for uniform spacing.
- Optional Cypress test to assert that each top‑level `<section>` contains the expected padding classes.

## Verification Plan
### Automated
- Lint and build.
- Script to parse rendered HTML for `py-12`/`py-16` on sections.
### Manual
- Open each page (Home, About, Contact, Portfolio, Services, Team) on desktop and mobile.
- Verify equal gaps between headings, paragraphs, images, and CTA buttons.
- Confirm Admin Panel sections reflect the same spacing.

---
*Please confirm the above plan or provide any adjustments.*
