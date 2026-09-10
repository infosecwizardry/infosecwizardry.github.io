# AGENTS.md

Static GitHub Pages site for InfoSec Wizard. Homepage only. Roadmap, Resources, Blogs, Labs, and CTFs are named, not built.

## Approach

**Think before coding. Surface tradeoffs. Don't hide confusion.**

Before implementing:

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

**For multi-step tasks, state a brief plan:**

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Transform vague tasks into verifiable goals: "Make hero better" → "Adjust hero copy sizing on mobile, then verify at 390px with no overlap of the staircase."

**Before implementing anything, always reason through foreseeable failure modes and state them explicitly.** For every change, think broadly about what could go wrong — responsive breakpoints, `prefers-reduced-motion`, hidden-tab/bfcache animation state, relative-path breakage under project pages, keyboard/focus behavior, and anything else specific to the change at hand. These are open-ended — don't limit the analysis to a fixed checklist.

After identifying issues, **always report them** in a named list — even if the fix is trivial. Format:

```
Foreseeable issues addressed:
1. [Issue] — [how it's handled]
2. [Issue] — [how it's handled]
```

Never silently handle an edge case without surfacing it.

---

**Protected systems — never touch without explicit permission:**

The following are off-limits unless the user explicitly asks. If any task would require modifying these — even incidentally — **stop, name the system, and get explicit written permission before proceeding:**

- **Hero staircase** (`js/stair.js`, `.stair` markup/styles in `index.html` / `css/site.css`) — slab stack order, face geometry, drop/settle/dissolve loop, reduced-motion still state, hidden-tab and bfcache reset.
- **Nav + mobile drawer** (`[data-nav]`, `[data-nav-trigger]`, `[data-nav-drawer]` in `index.html` / `js/site.js`) — open/close state, `aria-expanded`, focus handling.
- **GitHub Pages path contract** — all paths stay relative (`css/site.css`, `js/site.js`, `assets/...`, `./`). No root-absolute paths, no build step, no bundler.
- **Soon-route contract** — Roadmap, Resources, Blogs, Labs, CTFs stay marked `soon`, never linked dead. No 404-as-promise.
- **Brand copy** — wordmark is **InfoSec Wizard**, not "InfoSec Wizard Community". Voice per `PRODUCT.md`: blunt, craft, crew. No hype, no fake metrics.

Even cleanups or "minor" changes that touch these require explicit approval. If unsure whether a change touches them, assume it does and ask.

---

## Code Quality

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked. No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- No `# TODO`, `FIXME`, `HACK`, placeholder copy, or `lorem ipsum` — if something needs doing, do it now or don't mention it.
- No stub pages, dead links, hardcoded placeholder values, or "good enough for now" shortcuts.
- No compatibility shims, polyfills, or fallback paths for browsers/scenarios that don't exist yet.
- No fake authority: no invented metrics, testimonials, counts, or claims.
- If a proper solution requires more context or is out of scope, say so explicitly — don't write a half-measure.

**All code must be simple, organized, and optimized:**

- **Simple:** prefer the clearest solution. If a reader has to pause to understand it, simplify it.
- **Organized:** one responsibility per block, logical grouping, consistent naming.
- **Optimized:** avoid redundant work, unnecessary reflows, unthrottled listeners.
- **No dead code:** no unused selectors, scripts, assets, or commented-out blocks.
- **No duplication:** if the same rule or markup appears twice, extract it (shared class, CSS variable). Three similar lines is fine; four is a shared rule.

**Surgical changes — touch only what you must:**

- Don't "improve" adjacent copy, styles, or formatting. Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- Preserve unrelated user edits (especially `#operators` names/bios and copy).
- Every changed line should trace directly to the user's request.

---

## #1 Priority: Design Fidelity + Accessibility + Static-Hosting Safety

Every change must honor `PRODUCT.md` and `DESIGN.md`. They are the source of truth.

- **Monochrome only.** Paper/ink tokens in `DESIGN.md`. No pink/yellow/violet/indigo, no gradients, no neon SOC cliché.
- **Typography:** Anton/Impact uppercase headlines only. Archivo body. No em dashes, no hype.
- **Paths stay relative.** Verify project-pages serving (`username.github.io/repo`) never breaks.
- **Accessibility is the floor (WCAG 2.2 AA):** skip link, visible focus, keyboard-operable nav/drawer, `prefers-reduced-motion` honored, 16px+ body, 44px targets, real alt text, no `user-scalable=no`.
- **No new dependencies** (fonts already loaded via Google Fonts; no frameworks, no build tools) unless explicitly requested.

### Never write these patterns

| Instead of | Write |
|---|---|
| `/css/site.css`, `/assets/...` (root-absolute) | `css/site.css`, `assets/...` (relative) |
| Dead `<a href="#">` for unbuilt routes | `<span class="nav-soon">… <small>soon</small></span>` pattern |
| New color hex outside `DESIGN.md` tokens | Existing `--hero / --ink / --mid / --mute / --paper / --snow` |
| Gradient, blur pill nav, rainbow CTA rim | Flat fills, full-bleed black header, 2px-corner paper button |
| Motion that ignores reduced-motion | Still assembled state under `prefers-reduced-motion` |
| Inline `onclick` / blocking scripts in `<head>` | `defer` scripts at end of body (`js/site.js`, `js/stair.js`) |

---

## #2 Priority: Structure

```
index.html      Single page. Sections: header nav, hero (.stair + .hero__copy),
                .audience lanes, #operators grid, #coming grid, footer.
css/site.css    All styles. Tokens, layout, hero/stair, responsive breakpoints.
js/site.js      Nav/drawer, footer year, small progressive enhancements.
js/stair.js     Staircase loop only: drop → settle → hold → dissolve → replay.
assets/         mark.svg, operators/avatar.svg (default avatar).
PRODUCT.md      Voice, audiences, anti-references, design principles.
DESIGN.md       Color tokens, type, layout, hero object spec.
```

- `index.html` owns content. `css/` owns presentation. `js/` owns behavior. Never inline large style/script blocks into HTML.
- Staircase labels live on the camera-facing face, ink on paper. Stack order is fixed: Start → Skills → Labs → Certifications → Break in → Continue the grind.
- Operator edits are content swaps in `#operators` only — name, role line, bio, links. Photos default to `assets/operators/avatar.svg`.

---

## Project Navigation

### Read before modifying

Before changing copy, layout, or behavior, read the relevant file:

- Product voice, audiences, anti-references: `PRODUCT.md`
- Color, type, layout, hero object: `DESIGN.md`
- Setup and Pages deploy: `README.md`

When creating or modifying any visual code, **always find the closest existing pattern and follow its structure — do not start from a blank slate.**

---

## Commands

```bash
python3 -m http.server 4173
```

Open http://127.0.0.1:4173. No build, no install. Keep it that way.

## Deploy

Push to `main`. Settings → Pages → Deploy from branch → `main` / root (`/`).
