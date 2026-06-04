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
  assert.match(html, /<strong>78%<\/strong>/);
  assert.match(html, /automated alert testing for 78% of all endpoint detections/);
  assert.doesNotMatch(html, /<strong>85%<\/strong>/);
  assert.doesNotMatch(html, /<strong>95%<\/strong>/);
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

test("resume page keeps experience clean by omitting bullet tag chips", () => {
  const html = read("resume.html");
  const focusJs = read("assets/js/focus-areas.js");

  assert.doesNotMatch(html, /skill tags on each bullet/i);
  assert.doesNotMatch(html, /Click any tag/i);
  assert.match(html, /src="assets\/js\/focus-areas\.js\?v=/);
  assert.match(focusJs, /renderResumePage[\s\S]*renderPositionCard\(pos, false\)/);
  assert.doesNotMatch(focusJs, /renderResumePage[\s\S]*querySelectorAll\("\.bullet-tag"\)/);
});

test("production homepage does not ship old placeholder blog cards", () => {
  const html = read("index.html");

  assert.doesNotMatch(html, /Lessons from Building in Public/);
  assert.doesNotMatch(html, /Coming soon/);
  assert.doesNotMatch(html, /Replace the placeholders below/);
});
