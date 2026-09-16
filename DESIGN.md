# Design

Black and white lead. Purple-blue is a limited interaction accent. The marketing site we looked at was a layout cue only.

## Color

Strategy: **restrained monochrome with one accent.** Paper, ink, one mute gray, and purple-blue for selected interactive states. No gradients, report red, icon orange, or competing accent colors.

| Token | Hex | Role |
|---|---|---|
| `--hero` | `#0A0A0A` | Hero and header |
| `--ink` | `#111111` | Dark bands, type on paper |
| `--mid` | `#2A2A2A` | Mobile drawer, 3D sides |
| `--mute` | `#6E6E6E` | Captions, soon labels |
| `--fog` | `#9A9A9A` | Muted type on ink (meets AA where `--mute` does not) |
| `--slab-hi` | `#ECECE8` | Staircase lit top face |
| `--slab-lo` | `#BDBDB8` | Staircase bottom face |
| `--slab-side` | `#454545` | Staircase left face |
| `--slab-ink` | `#1A1A1A` | Staircase right face |
| `--well` | `#E4E9EE` | Operator photo well, avatar disc (asset copies in `assets/` are frozen duplicates, keep in sync manually) |
| `--dot` | `#C5C5BF` | Roadmap dot grid |
| `--accent` | `#3E3183` | Selected interactive states |
| `--accent-soft` | `#D8BEFF` | Accent text on dark surfaces |
| `--hair-strong` | `white / 0.34` | Pill hover border (stronger `--hair`) |
| `--paper` | `#F3F3F1` | Canvas |
| `--snow` | `#FAFAFA` | Raised plates |

Buttons: paper fill on ink, invert to outline on hover. 2px corners. No gradient rims.

## Typography

- Display: Anton (Impact fallback). Uppercase headlines only.
- Body: Archivo, 500, 1rem / 1.5.
- Kickers: 0.75rem, wide tracking, no boxed capsule.

## Layout

- Max 86.5rem. Pad 2.5rem / 1.875rem.
- Full-bleed black header, 1px hairline, not a floating frosted pill.
- Hero: copy in front. Staircase is a full-bleed background, behind type.

## Hero object

Thin 3D rectangular slabs, six real faces, stacked as a staircase behind the hero copy. Not cubes. Not buildings. Not a line tree.

- **Stack:** Start → Skills → Labs → Certifications → Break in → Continue the grind
- Face height `3.85rem`. Each slab sits on the one below (Y offset = height). They do not overlap through each other.
- Camera: looking down from the front-right. Perspective on the stage, not a flat card.
- Labels live on the camera-facing face, ink on paper.
- Loop: slabs drop from above onto the stack, settle on contact, hold, dissolve top-down, replay. Hidden tab, bfcache, and reduced-motion all reset the loop instead of resuming a half-finished cycle. `prefers-reduced-motion` is the assembled stack, still.
- Desktop: staircase lives in the right half, clear of the hero copy.
