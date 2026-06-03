# Sitewide Visual System Redesign Design

## Context

The portfolio is a static GitHub Pages site for Mike Small. The approved standalone preview in `redesign-preview/` establishes the new recruiter-first direction: sharper cyber defense positioning, stronger proof, modal evidence, and a more polished dark visual system.

Production currently has valuable content spread across:

- `index.html`: homepage, certifications, about, focus-area evidence, experience, GitHub projects, personal projects, resources, recommendations, blog placeholders, and contact.
- `resume.html`: data-driven full resume.
- `resources/*.html`: resource and recommendation pages, each with inline CSS.
- `assets/data/*.json`: certifications, experience, recommendations, personal goals, reading log, and focus-area data.
- `assets/js/*.js`: data renderers for recommendations, personal projects, and focus-area evidence.

The redesign should integrate the approved preview into production while preserving the site's information architecture and data-driven evidence behavior.

## Goals

1. Make production `index.html` match the approved recruiter-first preview quality.
2. Preserve all real information currently available on the site: resume, certifications, focus-area evidence, experience, GitHub projects, resources, recommendations, personal goals, reading log, and run log.
3. Remove or reframe placeholder sections that make the site feel unfinished.
4. Add a shared visual system so resource pages no longer carry duplicated one-off inline CSS.
5. Use a two-mode brand system:
   - Recruiter / portfolio sections: dark executive base, restrained teal/gold accents, and only supporting purple.
   - InfoSecWizard / resource sections: purple-forward brand treatment with polished spacing, cards, and modals.
6. Keep the standalone preview available as a reference until production is approved.

## Non-Goals

1. Do not delete the production data files.
2. Do not add resume downloading.
3. Do not remove existing resource pages.
4. Do not replace data-driven evidence modals with static decorative content.
5. Do not create fake links or placeholder "coming soon" CTAs.
6. Do not make the whole site a single purple theme; purple should be strongest where InfoSecWizard or learner resources are the focus.

## Approved Copy and Positioning

### Header Descriptor

`Offensively trained cyber defense leader`

### Hero Eyebrow

`Cyber Defense | SOC Leadership | Detection Engineering`

### Hero Headline

`I make cyber defense work when easy answers fail.`

### Hero Body

The hero should say that Mike solves operational problems that stall security programs: untrusted detections, unclear incident scope, orphaned telemetry, and teams stuck reacting. It should emphasize his range across offensive security, SOC leadership, detection engineering, incident response, forensics, and purple-team validation.

### Core Role Fit

The role panel should use:

`Where I create the most leverage.`

Role areas:

- Cyber Defense Leadership
- SOC Operations
- Detection Engineering
- Purple Team Validation

### Proof Points

Hero proof cards:

- `75%` alert-volume reduction through risk-based detection operations.
- `95%` high and critical detections covered by a custom assurance platform.
- `9 to 4` months cut from analyst job-readiness through structured training.

Professional proof section:

- Rebuilt detection operations from alert-by-alert handling into a risk-based strategy.
- Designed a validation framework for detection assurance, building core orchestration and attack modules that validated 95% of high/critical detections with real attack telemetry.
- Built standards, runbooks, analyst development programs, and delivery cadences that improved team capability.
- Turned after-action findings into training, workflows, playbooks, and standards that cut investigation time by more than 50%.

## Homepage Structure

Production `index.html` should include:

1. Sticky header with concise navigation.
2. Recruiter-first hero from the standalone preview.
3. Capability cards with evidence modals.
4. Professional proof section.
5. GitHub projects section using the existing live GitHub renderer.
6. Purple-forward InfoSecWizard and resource section.
7. Recommendations hub with links to existing recommendation category pages.
8. Current Goals section with InfosecWizard, reading, and endurance goals.
9. Contact section.
10. Focus-area, capability evidence, certification, and running-log modal markup.

The old placeholder blog cards should not ship in the final homepage.

## Shared Visual System

Create `assets/css/site.css` as the shared visual system for production pages.

Required theme classes:

- `portfolio-theme`: default recruiter/portfolio mode with dark base, teal interactions, gold section labels, and restrained purple.
- `infosec-theme`: purple-forward mode for InfoSecWizard and resource pages.
- `personal-theme`: optional quieter variant for reading/running/personal pages.

Shared components:

- `site-header`, `nav-shell`, `brand`, `brand-note`, `nav-links`
- `container`, `section`, `section-header`, `eyebrow`
- `btn`, `button`, `resource-card`, `goal-card`, `rec-tile`, `project-card`
- `focus-modal`, `evidence-modal`, `cert-modal`, `running-log-modal`
- `grid`, `card`, `pill`, `type-pill`, `empty-state`
- data-rendered classes used by `FocusAreas`, `Recommendations`, and `PersonalProjects`

## Resource Pages

Resource pages should be visually aligned with the homepage but purple-forward:

- `resources/soc-analyst.html`
- `resources/penetration-tester.html`
- `resources/books.html`
- `resources/training.html`
- `resources/labs.html`
- `resources/tools.html`
- `resources/podcasts.html`
- `resources/research.html`
- `resources/certifications.html`
- `resources/other.html`
- SOC analyst filtered pages
- `resources/reading-log.html`

The smaller recommendation pages can share a common structure: header, hero, section header, cards grid, footer, and the existing `Recommendations.render...` call.

The larger pathway pages should keep their special pathway interactions but inherit global tokens, cards, modal styling, and purple-forward accents.

## Interactions

Required homepage interactions:

- Capability cards open the capability evidence modal.
- Signal tags open the existing focus-area modal through `FocusAreas.openModalForArea(slug)`.
- Certification trigger opens a full certification modal from `assets/data/certifications-held.json`.
- Current Goals reading link navigates to `resources/reading-log.html`.
- Current Goals run-log button opens the running progress modal from `assets/data/personal-projects.json`.
- GitHub projects render from the existing GitHub API logic or a small equivalent module.
- Recommendation links route to the existing resource pages.

## Accessibility and Responsiveness

- Buttons that open modals must be `<button>`.
- Navigation links must be `<a>`.
- Dialogs must have `aria-labelledby`.
- The headshot must retain alt text.
- Cards and buttons must not overflow on mobile.
- Mobile layout should stack without overlapping text.
- Table content in modals should remain readable on narrow screens.

## Verification

Before completion:

1. Run production structure tests.
2. Run the existing preview tests.
3. Verify served production homepage contains approved hero copy, header descriptor, capability hooks, resource links, recommendations, current goals, and modal markup.
4. Verify served resource pages load the shared CSS and remain purple-forward.
5. Use headless Chrome where possible to click capability evidence, certification, focus-area, and run-log controls.
6. Confirm no production page still contains visible placeholder `Coming soon` blog cards or `href="#"` personal links.

## Open Questions

No blocking questions. The user approved planning and integration on June 3, 2026.
