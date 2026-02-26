# Dark Theme UI Redesign Plan - SlideUnlocker

## Color Palette

### Base Colors (Dark Foundation)
| Name | Hex Code | Usage |
|------|----------|-------|
| obsidian | `#0a0a0a` | Primary background |
| charcoal | `#121212` | Card backgrounds, elevated surfaces |
| graphite | `#1a1a1a` | Secondary surfaces, borders |
| smoke | `#2a2a2a` | Hover states, subtle borders |

### Jewel Tone Accents
| Name | Hex Code | Usage |
|------|----------|-------|
| sapphire | `#1e3a8a` / `#3b82f6` | Primary actions, links, headers |
| emerald | `#047857` / `#10b981` | Success states, confirmations |
| amethyst | `#6b21a8` / `#8b5cf6` | Accents, highlights, decorative |
| burgundy | `#7f1d1d` / `#dc2626` | Warnings, important alerts |

### Semantic Colors (Dark Mode Adapted)
| Name | Hex Code | Usage |
|------|----------|-------|
| text-primary | `#f8fafc` | Main headings, primary text |
| text-secondary | `#cbd5e1` | Body text, descriptions |
| text-muted | `#94a3b8` | Captions, hints, secondary info |

## Design System Components

### Typography
- Font Family: Inter (Google Fonts)
- Headings: 700-900 weight
- Body: 400-500 weight
- Sizes: Scale from 12px to 64px

### Spacing & Layout
- Container max-width: 1280px
- Base unit: 4px
- Section padding: 64px vertical, 24px horizontal
- Card padding: 24px
- Border radius: 8px (small), 16px (medium), 24px (large)

### Glassmorphism
- Background: rgba(26, 26, 26, 0.7)
- Backdrop blur: 12px
- Border: 1px solid rgba(255, 255, 255, 0.1)

### Glow Effects
- Primary glow: box-shadow with sapphire at 20% opacity
- Success glow: box-shadow with emerald at 20% opacity

## Component Redesign Specifications

### 1. Navigation Header
- Background: obsidian with glassmorphism
- Logo: gradient text using sapphire to amethyst
- Privacy badge: emerald accent pill

### 2. Hero Section
- Background: obsidian with radial gradient from graphite center
- Headings: text-primary with sapphire gradient on key phrase
- Stats bar: charcoal cards with subtle borders
- Glow accents: amethyst behind key elements

### 3. Drop Zone / File Card
- Background: charcoal with glassmorphism
- Border: dashed, 2px, smoke default, sapphire on hover
- Drag state: sapphire glow + scale(1.01)
- File info display: emerald for success, burgundy for error

### 4. Buttons
- Primary: sapphire gradient background, white text, glow on hover
- Success: emerald background with glow effect
- Secondary: transparent with smoke border, text-secondary

### 5. Alert/Status Messages
- Error: burgundy background with red accent
- Warning: amber (adapted for dark) with orange accent
- Success: emerald with green accent
- Info: sapphire with blue accent

### 6. Footer
- Background: charcoal
- Links: text-secondary, amethyst on hover
- Social icons: smoke background, jewel tone on hover

## Animations & Interactions

### Transitions
- Default: 200ms ease-out
- Hover states: scale(1.02) with shadow increase
- Active states: scale(0.98)
- Loading: spinner with sapphire color

### Micro-interactions
- Button hover: subtle glow + slight lift
- Card hover: border color change + shadow
- Input focus: ring with sapphire glow
- Success: checkmark animation with emerald pulse

## Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
