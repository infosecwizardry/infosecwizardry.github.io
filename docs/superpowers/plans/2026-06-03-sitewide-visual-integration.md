# Sitewide Visual Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the approved recruiter-first redesign into production and align the rest of the static site with the same polished visual system while keeping InfoSecWizard/resource pages purple-forward.

**Architecture:** Create a shared production stylesheet and a focused homepage JavaScript module. Replace production `index.html` with the approved preview structure plus the production-only content that must remain: GitHub projects, recommendations hub, current goals, focus-area evidence, certifications, and contact. Update subpages to load the shared visual system and use page theme classes while preserving existing data renderers and pathway interactions.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, existing `Recommendations`, `FocusAreas`, and personal project data, Node built-in test runner, local static server, headless Chrome smoke checks.

---

## File Structure

- Create `assets/css/site.css`: shared visual system for production homepage, resume, modals, data-rendered cards, goals, and resource pages.
- Create `assets/js/home.js`: homepage-only interactions copied from the approved preview and adjusted for production paths, plus the existing GitHub project renderer.
- Create `site.test.mjs`: production structure tests for homepage, shared CSS, homepage JS, resource page theme links, and placeholder cleanup.
- Modify `index.html`: production homepage structure based on the approved preview, with additional sections for GitHub projects and recommendations.
- Modify `resume.html`: remove duplicated inline visual shell and load shared `assets/css/site.css`.
- Modify `resources/*.html`: load shared CSS and theme classes; keep special page interactions intact.
- Preserve `redesign-preview/*`: reference preview remains available until final approval.

## Task 1: Production Structure Tests

**Files:**
- Create: `site.test.mjs`

- [ ] **Step 1: Write failing production tests**

Create `site.test.mjs` with tests that assert:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function read(relativePath) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

test("production homepage uses approved recruiter-first copy and production sections", () => {
  const html = read("index.html");

  assert.match(html, /Offensively trained cyber defense leader/);
  assert.match(html, /I make cyber defense work when easy answers fail\./);
  assert.match(html, /What I help teams do/);
  assert.match(html, /From stuck programs to measurable movement\./);
  assert.match(html, /GitHub Projects/);
  assert.match(html, /InfosecWizard shows how I teach practical security\./);
  assert.match(html, /Recommendations/);
  assert.match(html, /Current Goals/);
  assert.match(html, /Want to talk about a defensive leadership role\?/);
  assert.match(html, /href="resume.html"/);
  assert.match(html, /href="resources\/penetration-tester.html"/);
  assert.match(html, /href="resources\/reading-log.html"/);
});

test("production homepage wires required modal and data hooks", () => {
  const html = read("index.html");

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

  assert.match(html, /id="focus-area-modal"/);
  assert.match(html, /id="evidence-modal"/);
  assert.match(html, /id="certifications-modal"/);
  assert.match(html, /id="running-log-modal"/);
  assert.match(html, /id="projects-grid"/);
  assert.match(html, /src="assets\/js\/home.js/);
});

test("shared stylesheet contains portfolio and infosec theme systems", () => {
  const css = read("assets/css/site.css");

  assert.match(css, /portfolio-theme/);
  assert.match(css, /infosec-theme/);
  assert.match(css, /\.hero-shell/);
  assert.match(css, /\.capability-card/);
  assert.match(css, /\.resource-card/);
  assert.match(css, /\.rec-tile-grid/);
  assert.match(css, /\.goal-card/);
  assert.match(css, /\.focus-modal/);
  assert.match(css, /@media \(max-width: 760px\)/);
});

test("homepage script owns evidence, certifications, running log, and GitHub projects", () => {
  const js = read("assets/js/home.js");

  assert.match(js, /const EVIDENCE/);
  assert.match(js, /openEvidence/);
  assert.match(js, /openCertificationsModal/);
  assert.match(js, /openRunningLogModal/);
  assert.match(js, /loadProjects/);
  assert.match(js, /wireCapabilityCards/);
});

test("resource pages load shared css and remain purple-forward", () => {
  const resources = readdirSync("resources").filter((name) => name.endsWith(".html"));

  assert.ok(resources.length >= 10);

  for (const name of resources) {
    const html = read(path.join("resources", name));
    assert.match(html, /assets\/css\/site.css|..\/assets\/css\/site.css/, `${name} should load shared CSS`);
    assert.match(html, /class="[^"]*(infosec-theme|personal-theme)/, `${name} should declare a page theme`);
  }
});

test("production homepage does not ship old placeholder blog cards", () => {
  const html = read("index.html");

  assert.doesNotMatch(html, /Lessons from Building in Public/);
  assert.doesNotMatch(html, /Coming soon/);
  assert.doesNotMatch(html, /Replace the placeholders below/);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test site.test.mjs`

Expected: FAIL because `assets/css/site.css` and `assets/js/home.js` do not exist and production homepage still has the old layout.

## Task 2: Shared CSS System

**Files:**
- Create: `assets/css/site.css`

- [ ] **Step 1: Create shared visual system**

Create `assets/css/site.css` by adapting the approved `redesign-preview/assets/preview.css` into production paths and adding subpage/resource support:

- Keep restrained 8px cards.
- Use teal/gold for `.portfolio-theme`.
- Use purple/lavender as the dominant accent for `.infosec-theme`.
- Add `.personal-theme` with quieter cyan/purple balance.
- Include classes used by data renderers: `.card`, `.grid`, `.pill`, `.type-pill`, `.rec-card`, `.project-links`, `.position-card`, `.cert-badge`, `.empty-state`.
- Include resource page classes: `.subpage-hero`, `.rec-tile-grid`, `.filters-shell`, `.filter-chip`, `.pathway-card`, `.pathway-tile`, `.pathway-modal`.

- [ ] **Step 2: Run stylesheet test subset**

Run: `node --test site.test.mjs`

Expected: The shared stylesheet test should pass, while homepage and resource-page tests still fail.

## Task 3: Homepage JavaScript

**Files:**
- Create: `assets/js/home.js`

- [ ] **Step 1: Create homepage module**

Create `assets/js/home.js` from `redesign-preview/assets/preview.js`, adjusted for production:

- `CERTIFICATIONS_URL = new URL("../data/certifications-held.json", SCRIPT_URL).href`
- `PERSONAL_PROJECTS_URL = new URL("../data/personal-projects.json", SCRIPT_URL).href`
- Keep `EVIDENCE`, `openEvidence`, `openFocusArea`, `openCertificationsModal`, `openRunningLogModal`, and wiring functions.
- Add `loadProjects()` using the existing `infosecwizardry` GitHub API logic from production `index.html`.
- Render GitHub cards into `#projects-grid`.
- Do not use placeholder repo descriptions; if a repo has no description, render `Public GitHub project.`.

- [ ] **Step 2: Run homepage script test subset**

Run: `node --test site.test.mjs`

Expected: The homepage script test should pass, while homepage markup and resource-page tests may still fail.

## Task 4: Production Homepage Integration

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace homepage shell with approved production structure**

Replace production `index.html` with a full static page that:

- Links `assets/css/site.css?v=sitewide`.
- Uses `<body class="portfolio-theme">`.
- Uses the approved header descriptor and hero copy.
- Preserves full resume access through `resume.html`.
- Includes profile/role panel, signal tags, capability cards, proof section, GitHub projects, InfoSecWizard resources, recommendations hub, current goals, and contact.
- Includes focus-area, evidence, certifications, and running-log dialog markup.
- Loads scripts in this order:
  - `assets/js/recommendations.js`
  - `assets/js/focus-areas.js`
  - `assets/js/home.js?v=sitewide`

- [ ] **Step 2: Remove old placeholder blog section**

Confirm `index.html` does not contain:

- `Lessons from Building in Public`
- `Coming soon`
- `Replace the placeholders below`

- [ ] **Step 3: Run production tests**

Run: `node --test site.test.mjs`

Expected: Homepage copy, modal hooks, and placeholder cleanup tests pass. Resource-page tests may still fail.

## Task 5: Resume and Resource Page Theme Integration

**Files:**
- Modify: `resume.html`
- Modify: `resources/books.html`
- Modify: `resources/certifications.html`
- Modify: `resources/labs.html`
- Modify: `resources/other.html`
- Modify: `resources/penetration-tester.html`
- Modify: `resources/podcasts.html`
- Modify: `resources/reading-log.html`
- Modify: `resources/research.html`
- Modify: `resources/soc-analyst.html`
- Modify: `resources/soc-analyst-books.html`
- Modify: `resources/soc-analyst-content-creators.html`
- Modify: `resources/soc-analyst-podcasts.html`
- Modify: `resources/tools.html`
- Modify: `resources/training.html`

- [ ] **Step 1: Add shared CSS links**

For `resume.html`, add:

```html
<link rel="stylesheet" href="assets/css/site.css?v=sitewide" />
```

For each resource page, add:

```html
<link rel="stylesheet" href="../assets/css/site.css?v=sitewide" />
```

- [ ] **Step 2: Add page theme classes**

Use:

```html
<body class="portfolio-theme subpage">
```

for `resume.html`.

Use:

```html
<body class="infosec-theme subpage">
```

for InfoSec/resource pages.

Use:

```html
<body class="personal-theme subpage">
```

for `resources/reading-log.html`.

- [ ] **Step 3: Keep special page logic intact**

Do not remove:

- `Recommendations.render...` calls.
- SOC analyst pathway script.
- Reading log filtering script.
- Penetration tester static sections.
- Resume `FocusAreas.renderResumePage("resume-stack")`.

- [ ] **Step 4: Run production tests**

Run: `node --test site.test.mjs`

Expected: Resource page shared CSS and theme tests pass.

## Task 6: Full Verification

**Files:**
- Verify: `index.html`
- Verify: `resume.html`
- Verify: `resources/*.html`
- Verify: `redesign-preview/preview.test.mjs`

- [ ] **Step 1: Run production and preview tests**

Run:

```powershell
node --test site.test.mjs
node --test redesign-preview\preview.test.mjs
```

Expected: Both test files pass.

- [ ] **Step 2: Verify served homepage content**

Run:

```powershell
$response = Invoke-WebRequest -Uri 'http://127.0.0.1:54873/index.html?v=sitewide' -UseBasicParsing
```

Expected: The served content contains `Offensively trained cyber defense leader`, `Current Goals`, `GitHub Projects`, and `assets/js/home.js?v=sitewide`.

- [ ] **Step 3: Verify real homepage clicks in headless Chrome**

Use headless Chrome through the DevTools protocol to:

- Open `http://127.0.0.1:54873/index.html?v=sitewide`.
- Click `[data-evidence="operate"]` and verify `#evidence-modal` opens.
- Click `[data-certifications-trigger]` and verify `#certifications-modal` opens with certification cards.
- Click `[data-running-log-trigger]` and verify `#running-log-modal` opens with weekly mileage.

Expected: All target modals open and contain populated content.

- [ ] **Step 4: Verify resource pages serve shared CSS**

Run served checks for:

- `/resources/soc-analyst.html?v=sitewide`
- `/resources/penetration-tester.html?v=sitewide`
- `/resources/books.html?v=sitewide`
- `/resources/reading-log.html?v=sitewide`

Expected: Each page responds with `200` and references `../assets/css/site.css?v=sitewide`.

## Self-Review

- Spec coverage: The tasks cover homepage integration, visual system, InfoSec purple treatment, resource page alignment, modal preservation, current goals, and verification.
- Placeholder scan: No task contains TBD/TODO/fill-in placeholders.
- Type consistency: Function and file names match across tasks: `openEvidence`, `openCertificationsModal`, `openRunningLogModal`, `loadProjects`, `assets/css/site.css`, `assets/js/home.js`, and `site.test.mjs`.
