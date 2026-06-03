# Cyber Defense Standalone Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone recruiter-first cyber defense portfolio preview that preserves the current production homepage while making the redesigned flow testable before replacement.

**Architecture:** The preview lives in its own `redesign-preview/` folder and links back to existing production data and scripts for focus-area evidence. A small preview-specific JavaScript module owns only the new capability proof modal and signal-tag wiring. CSS is scoped to the preview folder so the current homepage and resource pages are untouched.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, existing `Recommendations` and `FocusAreas` browser modules, Node's built-in test runner, local static server, Browser verification.

---

## File Structure

- Create `redesign-preview/index.html`: standalone preview page with recruiter-first hero, capability cards, proof section, InfosecWizard section, contact section, focus-area modal markup, and capability evidence modal markup.
- Create `redesign-preview/assets/preview.css`: preview-only visual system, responsive layout, card styles, buttons, focus-area modal styles, capability modal styles, and InfosecWizard purple treatment.
- Create `redesign-preview/assets/preview.js`: preview-only interaction module for capability evidence modals, signal-tag buttons, smooth anchor navigation, and initialization of the existing `FocusAreas` modal chrome.
- Create `redesign-preview/preview.test.mjs`: Node structure tests that prove the standalone preview includes required copy, CTAs, scripts, modal hooks, signal tags, and evidence data.

## Task 1: Preview Structure Test

**Files:**
- Create: `redesign-preview/preview.test.mjs`
- Test: `redesign-preview/preview.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readPreview(relativePath) {
  return readFileSync(path.join(__dirname, relativePath), "utf8");
}

test("standalone preview contains approved recruiter-first content and links", () => {
  const html = readPreview("index.html");

  assert.match(html, /I make cyber defense work when the easy answers stop working\./);
  assert.match(html, /Cyber Defense \| SOC Leadership \| Detection Engineering/);
  assert.match(html, /href="#capabilities"/);
  assert.match(html, /href="..\/resume.html"/);
  assert.match(html, /href="#contact"/);
  assert.match(html, /Where I create the most leverage\./);
  assert.match(html, /InfosecWizard shows how I teach practical security\./);
  assert.match(html, /Want to talk about a defensive leadership role\?/);
});

test("standalone preview wires capability evidence and signal evidence modals", () => {
  const html = readPreview("index.html");

  for (const key of ["operate", "detect", "respond", "validate"]) {
    assert.match(html, new RegExp(`data-evidence="${key}"`));
  }

  for (const slug of [
    "security-operations",
    "detection-engineering",
    "incident-response",
    "threat-hunting",
    "purple-teaming",
    "leadership"
  ]) {
    assert.match(html, new RegExp(`data-focus="${slug}"`));
  }

  assert.match(html, /id="evidence-modal"/);
  assert.match(html, /id="focus-area-modal"/);
  assert.match(html, /id="focus-modal-title"/);
  assert.match(html, /id="focus-modal-body"/);
  assert.match(html, /src="..\/assets\/js\/recommendations.js"/);
  assert.match(html, /src="..\/assets\/js\/focus-areas.js"/);
  assert.match(html, /src="assets\/preview.js"/);
});

test("preview script contains the required capability proof model", () => {
  const script = readPreview("assets/preview.js");

  assert.match(script, /const EVIDENCE/);
  assert.match(script, /Make SOC work more reliable/);
  assert.match(script, /Build detections teams can trust/);
  assert.match(script, /Turn incidents into decisions/);
  assert.match(script, /Prove defenses against real behavior/);
  assert.match(script, /openEvidence/);
  assert.match(script, /openFocusArea/);
  assert.match(script, /wireCapabilityCards/);
});

test("preview stylesheet contains standalone visual and modal systems", () => {
  const css = readPreview("assets/preview.css");

  assert.match(css, /\.hero-shell/);
  assert.match(css, /\.capability-card/);
  assert.match(css, /\.evidence-modal/);
  assert.match(css, /\.focus-modal/);
  assert.match(css, /\.infosec-section/);
  assert.match(css, /@media \(max-width: 760px\)/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test redesign-preview/preview.test.mjs`

Expected: FAIL because `redesign-preview/index.html`, `redesign-preview/assets/preview.css`, and `redesign-preview/assets/preview.js` do not exist yet.

## Task 2: Standalone Preview Page

**Files:**
- Create: `redesign-preview/index.html`
- Create: `redesign-preview/assets/preview.css`
- Create: `redesign-preview/assets/preview.js`
- Test: `redesign-preview/preview.test.mjs`

- [ ] **Step 1: Implement the standalone HTML**

Create a complete page at `redesign-preview/index.html` with:

- Header brand `Mike Small`.
- Nav links to `#capabilities`, `#proof`, `#infosec-wizard`, `../resume.html`, and `#contact`.
- Hero eyebrow, headline, body, proof cards, and CTAs from the approved spec.
- Profile and role-fit panel with clickable signal tags using `data-focus` slugs.
- Four capability cards with `data-evidence` keys.
- Professional proof, InfosecWizard, and contact sections using approved production copy.
- `<dialog id="focus-area-modal">` markup matching the existing `FocusAreas` API.
- `<dialog id="evidence-modal">` markup for capability proof.
- Scripts in this order: `../assets/js/recommendations.js`, `../assets/js/focus-areas.js`, `assets/preview.js`.

- [ ] **Step 2: Implement preview-only styles**

Create `redesign-preview/assets/preview.css` with:

- Dark executive base, teal and gold recruiter accents, restrained cards at 8px radius.
- Purple-forward styling only for the InfosecWizard section.
- Responsive desktop two-column hero and stacked mobile layout.
- Modal styles for both `.evidence-modal` and `.focus-modal`.
- Existing `FocusAreas` renderer support classes including `.card`, `.pill`, `.grid`, `.position-card`, `.cert-badge`, `.rec-card`, `.empty-state`, and `.project-links`.

- [ ] **Step 3: Implement preview interactions**

Create `redesign-preview/assets/preview.js` with:

- `EVIDENCE` object containing the four approved capability modal payloads.
- `openEvidence(key)` to populate and open `#evidence-modal`.
- `wireCapabilityCards()` to open capability evidence when the card or action is clicked.
- `openFocusArea(slug)` to call `window.FocusAreas.openModalForArea(slug)`.
- `wireSignalTags()` to connect `data-focus` buttons to focus-area modals.
- `wireEvidenceModal()` to support close button, backdrop click, and `Esc` through native dialog behavior.
- `init()` that wires everything after DOM ready and calls `FocusAreas.wireModalChrome()` and `FocusAreas.maybeOpenFromHash()` when available.

- [ ] **Step 4: Run the structure test to verify it passes**

Run: `node --test redesign-preview/preview.test.mjs`

Expected: PASS.

## Task 3: Browser Verification

**Files:**
- Verify: `redesign-preview/index.html`

- [ ] **Step 1: Open the preview in the local static server**

Open: `http://127.0.0.1:54873/redesign-preview/index.html`

Expected: The standalone preview loads without replacing the current homepage.

- [ ] **Step 2: Verify capability modals**

Click each capability card:

- `Make SOC work more reliable`
- `Build detections teams can trust`
- `Turn incidents into decisions`
- `Prove defenses against real behavior`

Expected: Each opens `#evidence-modal` with the matching metrics and proof bullets.

- [ ] **Step 3: Verify signal-tag focus evidence**

Click signal tags:

- `Security Operations`
- `Detection Engineering`
- `Incident Response`
- `Threat Hunting`
- `Purple Teaming`
- `Leadership`

Expected: Each opens the existing `#focus-area-modal` and renders supporting evidence.

- [ ] **Step 4: Verify CTAs and links**

Check:

- `Explore Capabilities` scrolls to `#capabilities`.
- `View Full Resume` opens `../resume.html`.
- `Contact Me` scrolls to `#contact`.
- InfosecWizard links open the intended YouTube/resource destinations.
- Contact links point to resume, LinkedIn, GitHub, and email.

Expected: Links navigate correctly and no console errors appear from the preview module.

- [ ] **Step 5: Verify responsive layout**

Inspect desktop and mobile widths.

Expected: Desktop uses a two-column hero, mobile stacks sections without text overflow or overlapping UI.

