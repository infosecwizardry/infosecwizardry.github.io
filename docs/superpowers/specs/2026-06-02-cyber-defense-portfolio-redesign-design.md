# Cyber Defense Portfolio Redesign Design

## Context

The portfolio is a static GitHub Pages site for Mike Small. The primary audience is hiring managers and recruiters evaluating Mike for defensive leadership roles: cyber defense leadership, SOC operations leadership, detection engineering leadership, and purple-team / validation leadership. A secondary audience is cybersecurity learners who may discover or evaluate InfosecWizard.

The current homepage already contains valuable evidence: data-driven focus-area modals, experience bullets, certifications, GitHub projects, recommendations, personal projects, a full resume page, and InfosecWizard links. The redesign should preserve that evidence model while making the first screen sharper, more premium, and faster to understand.

The approved visual reference is the local brainstorming mock-up:

`/.superpowers/brainstorm/cyber-defense-hero-mockup.html`

This mock-up is not production code, but it establishes the desired layout, tone, and palette.

## Goals

1. Make the homepage immediately communicate that Mike is an offense-informed cyber defense leader who solves hard security program problems.
2. Help recruiters understand the role fit quickly: cyber defense leadership, SOC operations, detection engineering, and purple-team validation.
3. Preserve and improve the current evidence behavior where users can click claims, tags, or capabilities and see the experience, certs, projects, and resources that support them.
4. Keep InfosecWizard visible as public evidence of teaching, practical communication, and learner enablement without making it compete with the recruiter-first hero.
5. Move the visual system toward a premium, polished cyber defense feel: darker executive base, teal/gold recruiter-facing accents, and purple-forward InfosecWizard/resource branding.

## Non-Goals

1. Do not add a resume download. The call to action should link to the existing full resume page.
2. Do not remove existing data-driven content such as recommendations, reading log, certifications, focus areas, or personal projects.
3. Do not turn the homepage into a marketing landing page with generic sales copy.
4. Do not ship placeholder/meta copy such as "this section would..." or "capability-first positioning..."
5. Do not break the current resource pages or recommendation rendering.

## Approved Hero Direction

### Eyebrow

`Cyber Defense | SOC Leadership | Detection Engineering`

### Headline

`I make cyber defense work when the easy answers stop working.`

### Body Copy

The hero should communicate:

- Mike solves hard operational problems behind security programs.
- Examples include detections no one trusts, incidents no one can scope, telemetry no one owns, and teams stuck reacting instead of improving.
- His range across offensive security, SOC leadership, detection engineering, incident response, forensics, and purple-team validation lets him find the real constraint and help organizations make a serious jump in defensive capability.

### Hero CTAs

- `Explore Capabilities` links to the capability cards.
- `View Full Resume` links to `resume.html`.
- `Contact Me` links to the contact section.

### Hero Proof Cards

Use the following three proof cards:

- `75%` alert-volume reduction through risk-based detection operations.
- `95%` high and critical detections covered by a custom assurance platform.
- `9 to 4` months cut from analyst job-readiness through structured training.

These cards should read as executive proof, not implementation inventory.

## Homepage Layout

### Header

Use a restrained sticky header with:

- Brand: `Mike Small`
- Small descriptor: `Offense-informed cyber defense leadership`
- Navigation: `Capabilities`, `Proof`, `InfosecWizard`, `Full Resume`, `Contact`

The header should be less crowded than the current navigation. Lower-priority destinations can remain accessible through sections, modals, or secondary links.

### First Viewport

The first viewport should use a two-column layout on desktop:

- Left: hero message, CTAs, and proof cards.
- Right: profile panel and role-fit panel.

The right panel should not use self-justifying language such as "why it fits." It should read as premium positioning:

`Where I create the most leverage.`

Role areas:

- Cyber Defense Leadership: Set direction, create operating rhythm, align teams, and turn security priorities into measurable execution.
- SOC Operations: Reduce noise, improve investigation quality, sharpen escalation, and build teams that respond consistently.
- Detection Engineering: Connect attacker behavior, telemetry, tuning, validation, and drift monitoring into detections teams trust.
- Purple Team Validation: Use offensive execution to prove defensive coverage, expose fragile assumptions, and guide better engineering decisions.

Signal tags shown in this panel should be clickable and route into the existing focus-area evidence modal behavior.

### Capabilities Section

Heading:

`What I help teams do`

Supporting copy:

`Four ways I help defensive programs move from scattered effort to stronger, repeatable capability.`

Capability cards:

1. Operate: `Make SOC work more reliable`
2. Detect: `Build detections teams can trust`
3. Respond: `Turn incidents into decisions`
4. Validate: `Prove defenses against real behavior`

Each card should have a `View evidence` action. Clicking the card or the action should open a modal, not expand inline.

### Capability Evidence Modals

The modal pattern should match the current site's focus-area modal quality: centered dialog, dark backdrop blur, clear title, proof metrics, proof bullets, and links to full resume/contact.

#### Operate Modal

Title:

`Make SOC work more reliable`

Metrics:

- `10+` major initiatives delivered after project and ownership rebuild.
- `3 weeks` formal threat-hunting cadence built from ad hoc hunts.
- `66%+` average open-to-close time reduction after delivery standardization.

Proof bullets:

- Rebuilt detection operations from alert-by-alert workflows into a risk-based strategy using host, network, and cloud telemetry review.
- Created operating standards through investigation standards, runbooks, and playbook-driven workflows across SOC, detection, hunting, malware, and forensics.
- Unblocked delivery by moving stalled security operations projects through completion with clearer ownership, dependencies, and milestones.

#### Detect Modal

Title:

`Build detections teams can trust`

Metrics:

- `Weeks to hours` detection drift discovery through dashboards, alerts, and executive metrics.
- `Multi-source` telemetry correlated across endpoint, cloud, SIEM, SQL, and data platforms.
- `Attack variants` controlled tests used to expose gaps and drive detection fixes.

Proof bullets:

- Built detection health monitoring that exposed drift, broken logic, telemetry gaps, and control degradation before changes degraded production quality.
- Turned attack runs into detection work by executing controlled attack variations, comparing what defenders could actually see, and turning gaps into concrete detection, logging, and telemetry improvements.
- Closed hard visibility gaps in Active Directory attacks, load-balanced traffic, and domain fronting.

#### Respond Modal

Title:

`Turn incidents into decisions`

Metrics:

- `66%+` average open-to-close time reduction after workflow rebuild.
- `After-action loop` findings converted into training, workflows, playbooks, and standards.
- `2x+` investigation bench expanded through analyst-to-IR development.

Proof bullets:

- Led major investigations as incident commander and analyst for advanced persistent threat, nation-state, and multi-stage intrusion activity.
- Built an improvement pipeline that converted investigation misses and post-incident findings into updated training, workflows, playbooks, and standards so investigations became more thorough and open-to-close time dropped by more than 50%.
- Built response capacity through onboarding and analyst growth programs that made more people ready to support investigations without lowering investigation quality.

#### Validate Modal

Title:

`Prove defenses against real behavior`

Metrics:

- `30-46` analysts per quarter put through realistic end-to-end incidents.
- `Top threats` validation mapped to financial-sector threat actors with CTI.
- `Custom C2` hands-on-keyboard emulation built when commercial tooling could not provide it.

Proof bullets:

- Scaled a custom AWS AMI-based detection assurance platform by shaping technical vision, cross-team execution, and adoption strategy.
- Built hands-on-keyboard emulation by extending Mandiant Security Validation with custom command-and-control tooling so analysts could investigate realistic operator behavior the commercial platform could not simulate.
- Made validation threat-informed by partnering with CTI to test coverage against top financial-sector threat actors and report coverage to senior leadership.

### Clickable Signal Tags

The redesign must preserve the current tag-to-evidence behavior.

Signal tags in the hero/right panel and elsewhere should call the existing `FocusAreas.openModalForArea(slug)` behavior, using existing slugs such as:

- `security-operations`
- `detection-engineering`
- `incident-response`
- `threat-hunting`
- `purple-teaming`
- `leadership`

These focus-area modals should continue pulling together:

- Relevant experience bullets
- Certifications
- Projects
- Recommended resources

If a signal tag is shown, it must either open a real evidence modal or be rendered as non-clickable text. No decorative fake tags.

### Professional Proof Section

Use production copy:

`From stuck programs to measurable movement.`

Body:

`The pattern across my work is consistent: diagnose the constraint, build the operating model, tooling, training, or validation loop around it, and make the improvement visible to the people who depend on the program.`

Bullets:

- Rebuilt detection operations from alert-by-alert handling into a risk-based strategy.
- Scaled a custom detection assurance platform for high and critical detections using offensive execution and real telemetry.
- Built standards, runbooks, analyst development programs, and delivery cadences that improved team capability.

### InfosecWizard Section

InfosecWizard should be visible as public evidence, not the primary homepage positioning.

Heading:

`InfosecWizard shows how I teach practical security.`

Body:

`I use InfosecWizard to turn real defensive security experience into clear, hands-on learning paths for people building SOC analyst skill, investigation confidence, and portfolio evidence.`

Keep links to:

- YouTube channel
- SOC analyst resources
- Recommendations/resources hub where appropriate

The InfosecWizard/resource area should preserve the purple brand family from the current portfolio, but use the same polished spacing, typography, and card quality as the redesigned recruiter-facing homepage.

### Contact Section

Use production copy:

`Want to talk about a defensive leadership role?`

Body:

`For defensive leadership, SOC operations, detection engineering, or purple-team validation roles, start with the full resume or reach out directly.`

Links:

- Full Resume
- LinkedIn
- GitHub
- Email

## Visual Design

### Recruiter-Facing Homepage Palette

Use the mock-up's executive cyber defense palette:

- Near-black background.
- Dark charcoal cards.
- Teal accent for primary proof and interaction.
- Gold accent for premium section labels.
- Purple used sparingly on the recruiter-facing sections.

### InfosecWizard / Resources Palette

Use the existing purple brand as the stronger accent in InfosecWizard and resource sections:

- Purple gradients or purple-accent panels are acceptable here.
- Avoid making the entire site one-note purple.
- The transition should feel intentional: executive defense portfolio first, brand/community proof second.

### Shape and Layout

- Cards and panels should use an 8px radius or similarly restrained radius.
- Avoid nested cards.
- Keep typography large and confident in the hero, tighter and more utilitarian in cards and modals.
- Do not use decorative orbs or bokeh-style blobs.
- Ensure mobile text never overflows cards/buttons.

## Data and Interaction Design

The site is static and data-driven in places.

Recommended implementation:

1. Keep `FocusAreas` as the source for focus-area evidence modals.
2. Add a small homepage evidence data structure for the four capability modals, either inline in `index.html` or in a focused JS file if the implementation gets large.
3. Reuse existing escape/render helpers where possible.
4. Keep link paths relative to production page locations, not the `.superpowers` mock-up path.

Modal behavior:

- Clicking a capability card or `View evidence` opens the capability modal.
- Clicking a signal tag opens the corresponding focus-area modal.
- Close buttons, backdrop click, and `Esc` should close dialogs.
- Modals should be keyboard accessible and have correct labels.

## Error Handling

- If data files fail to load, existing empty/error states should remain clear and non-broken.
- If GitHub repo fetch fails, the site should continue to render core portfolio content.
- If a focus-area tag has no supporting content, do not show it as a primary clickable signal.

## Accessibility

- Use semantic headings in order.
- Buttons that open modals must be real `<button>` elements.
- Links that navigate must be `<a>` elements.
- Dialogs should have `aria-labelledby`.
- Images must retain useful alt text.
- Maintain readable contrast across teal, gold, purple, and muted text.

## Responsive Behavior

- Desktop: two-column hero with left hero and right profile/role-fit panels.
- Tablet/mobile: stack hero, profile, role fit, proof cards, and capability cards.
- Capability cards should remain easy to tap.
- Modal content should fit within viewport height and scroll internally when needed.
- Header navigation should wrap or simplify without text overlap.

## Implementation Scope

Expected files:

- Modify `index.html` for the homepage structure, inline CSS, hero copy, capability cards, proof sections, contact section, and modal markup.
- Modify `assets/js/focus-areas.js` only if existing modal functions need to be exposed or adjusted for signal-tag clicks.
- Avoid touching `resume.html` unless link targets or visual alignment need small updates.
- Avoid changing data files unless a required evidence item needs to be moved into data for maintainability.
- Do not remove existing resource pages.

## Verification

Before calling implementation complete:

1. Run a local static server.
2. Open the homepage in the browser.
3. Verify first viewport on desktop.
4. Verify mobile viewport layout.
5. Click all hero CTAs.
6. Click each capability card and verify modal content.
7. Click each signal tag and verify it opens the supporting evidence modal.
8. Verify full resume link works.
9. Verify InfosecWizard/resource links work.
10. Check console for errors.

## Open Questions

None blocking implementation. If a specific proof point feels overstated during implementation, keep the stronger truthful version and preserve the intent: leadership-level evidence over implementation inventory.
