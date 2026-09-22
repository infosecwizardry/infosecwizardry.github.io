# Design

Paper, ink, and one Spectrum purple. No rainbow. The marketing site we looked at was a layout cue only.

## Color

Strategy: **paper and ink, one accent family.** Neutrals stay gray. Hue is a purple/blue ramp. No yellow, report red, or icon orange.

| Token | Hex | Role |
|---|---|---|
| `--hero` | `#0A0A0A` | Hero and header |
| `--black` | `#000000` | True black (Spectrum hero ink). Do not collapse with `--hero` until a visual pass says so |
| `--white` | `#FFFFFF` | True white (Spectrum `--neutral--neutral-white`) |
| `--accent` | `#A868E3` | Named Purple. CTA hover fill |
| `--ramp-light` | `#D8BEFF` | Light Purple |
| `--ramp-purple` | `#A868E3` | Purple |
| `--ramp-mid` | `#744EC3` | Blend Purple → Blue |
| `--ramp-blue` | `#4135C3` | Blue |
| `--ramp-deep` | `#3E3183` | Purple Blue |
| `--ramp` | light → purple → blue → deep → light | `.hero__ghost` underline; live `a.coming-item` hover rim |
| `--ramp-conic` | same family, out-and-back stops | Color list for `conic-gradient(from var(--rim-angle))` |
| `--rim-width` | `3px` | Purple outline on hero/footer `.btn`, `.nav__cta`, `.hero__ghost` underline |
| `--ink` | `#111111` | Dark bands, type on paper |
| `--mid` | `#2A2A2A` | Mobile drawer, 3D sides |
| `--mute` | `#6E6E6E` | Captions, soon labels |
| `--fog` | `#9A9A9A` | Muted type on ink (meets AA where `--mute` does not) |
| `--slab-hi` | `#F6F6F2` | Staircase lit top face |
| `--slab-lo` | `#BDBDB8` | Staircase bottom face |
| `--slab-front` | `#E8E8E4` | Staircase camera-facing paper |
| `--slab-side` | `#5A4A78` | Staircase left face, cool bounce toward `--ramp-deep` |
| `--slab-ink` | `#3E3183` | Staircase right face (`--ramp-deep`) |
| `--well` | `#E4E9EE` | Operator photo well, avatar disc (asset copies in `assets/` are frozen duplicates, keep in sync manually) |
| `--dot` | `#C5C5BF` | Roadmap dot grid |
| `--hair` | `white / 0.12` | Idle coming-card hairline, desktop nav pill border |
| `--hair-strong` | `white / 0.34` | Pill hover border |
| `--paper` | `#F3F3F1` | Canvas |
| `--snow` | `#FAFAFA` | Raised plates |

Buttons: paper fill on ink, invert to outline on hover. Pill radius (`--radius-cta`). Hero and footer `.btn` use a `--rim-width` (3px) conic rim (`--ramp-conic` from `--rim-angle`). Idle fill matches the band (`--hero` / `--ink`); hover fill is `--accent`, type `--ink`. Rim rotates 4s linear unless `prefers-reduced-motion: reduce` (static rim).

Desktop `.nav__cta` is paper fill with the same 3px conic rim (fewer, stronger purple/blue stops so it reads on paper). Hover/focus fill is `--accent`, type `--ink`. Drawer open/close and focus handling unchanged.

Also `--ramp`, not a flood: `.hero__ghost` (hero Join) is `inline-block` with a 3px ramp underline that tiles every 8rem and shifts 8rem in 4s (seamless loop). Hover/focus type is `--accent`. Live `a.coming-item` (Roadmap) rim on hover/focus (linear travel). Soon cards stay mute hairline. Stair camera face uses the same `--rim-width` conic rim as `.hero .btn` (`--ramp-conic` from inherited `--stair-rim-angle`, 4s on `.stair`). Fill stays `--slab-front`. Shadow faces stay `--slab-side` / `--slab-ink`. The drop loop does not cancel this animation. `prefers-reduced-motion` is a static rim. No glow.

Desktop `.nav__pill` fill is only `.nav__glass`. Outline is the original 1px `--hair` hairline, `--hair-strong` on hover. No purple ring on the header shell. Drawer open/close and focus handling unchanged.

## Typography

- Display: Anton (Impact fallback). Uppercase headlines only.
- Body: Archivo, 500, 1rem / 1.5.
- Kickers: 0.75rem, wide tracking, no boxed capsule.

## Layout

- Max 86.5rem. Pad 2.5rem / 1.875rem.
- Full-bleed black header on small screens. Desktop: floating frosted `.nav__pill` with a `--ramp` hairline.
- Hero: copy in front. Staircase is a full-bleed background, behind type.

## Hero object

Thin 3D rectangular slabs, six real faces, stacked as a staircase behind the hero copy. Not cubes. Not buildings. Not a line tree.

- **Stack:** Start → Skills → Labs → Certifications → Break in → Continue the grind
- Face height `3.85rem`, depth `1.35rem`, width `11.25rem`. Each slab sits on the one below (Y offset = height). X step `4.15rem`. They do not overlap through each other. Paint is lip + bounce; geometry is the original thin rectangles.
- Camera: looking down from the front-right. Perspective on the stage, not a flat card.
- Labels live on the camera-facing face, ink on paper.
- Loop: slabs drop from above onto the stack, settle on contact, hold, dissolve top-down, replay. Hidden tab, bfcache, and reduced-motion all reset the loop instead of resuming a half-finished cycle. `prefers-reduced-motion` is the assembled stack, still.
- Desktop: staircase lives in the right half, clear of the hero copy.
