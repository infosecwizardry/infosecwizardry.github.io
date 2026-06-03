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

function readProject(relativePath) {
  return readFileSync(path.join(__dirname, "..", relativePath), "utf8");
}

test("standalone preview contains approved recruiter-first content and links", () => {
  const html = readPreview("index.html");

  assert.match(html, /I make cyber defense work when easy answers fail\./);
  assert.match(html, /Offensively trained cyber defense leader/);
  assert.doesNotMatch(html, /Offense-informed cyber defense leadership/);
  assert.match(html, /Cyber Defense \| SOC Leadership \| Detection Engineering/);
  assert.match(html, /href="#capabilities"/);
  assert.match(html, /href="..\/resume.html"/);
  assert.match(html, /href="#contact"/);
  assert.match(html, /Where I create the most leverage\./);
  assert.match(html, /InfosecWizard shows how I teach practical security\./);
  assert.match(html, /Want to talk about a defensive leadership role\?/);
  assert.match(html, /18 certifications/);
  assert.match(html, /Penetration testing pathway/);
  assert.match(html, /href="..\/resources\/penetration-tester.html"/);
  assert.match(html, /Designed a validation framework for detection assurance, building core orchestration and attack modules that validated 95% of high\/critical detections with real attack telemetry\./);
  assert.match(html, /href="#current-goals"/);
  assert.match(html, /Current Goals/);
  assert.match(html, /Help 50 people break into cybersecurity/);
  assert.match(html, /Reach 5,000 watch hours/);
  assert.match(html, /Read one book per month/);
  assert.match(html, /60-mile ultra marathon/);
  assert.match(html, /Sub-3 hour marathon/);
  assert.match(html, /href="..\/resources\/reading-log.html"/);
  assert.match(html, /View run log/);
  assert.match(html, /data-running-log-trigger/);
  assert.match(html, /id="running-log-modal"/);
  assert.match(html, /id="running-log-body"/);
});

test("personal project source data tracks the reading goal", () => {
  const data = JSON.parse(readProject("assets/data/personal-projects.json"));
  const reading = data.items.find((item) => item.id === "currently-reading");

  assert.ok(reading);
  assert.deepEqual(reading.goals, ["Read one book per month"]);
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
  assert.match(html, /data-certifications-trigger/);
  assert.match(html, /View all 18 certifications/);
  assert.match(html, /id="certifications-modal"/);
  assert.match(html, /id="certifications-modal-body"/);
  assert.match(html, /id="focus-area-modal"/);
  assert.match(html, /id="focus-modal-title"/);
  assert.match(html, /id="focus-modal-body"/);
  assert.match(html, /src="..\/assets\/js\/recommendations.js"/);
  assert.match(html, /src="..\/assets\/js\/focus-areas.js"/);
  assert.match(html, /src="assets\/preview.js\?v=run-log"/);
  assert.match(html, /href="assets\/preview.css\?v=run-log"/);
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
  assert.match(script, /loadCertifications/);
  assert.match(script, /openCertificationsModal/);
  assert.match(script, /wireCertificationsModal/);
  assert.match(script, /loadPersonalProjects/);
  assert.match(script, /openRunningLogModal/);
  assert.match(script, /renderRunningLog/);
  assert.match(script, /wireRunningLogModal/);
  assert.match(script, /wireCapabilityCards/);
});

test("preview stylesheet contains standalone visual and modal systems", () => {
  const css = readPreview("assets/preview.css");

  assert.match(css, /\.hero-shell/);
  assert.match(css, /\.capability-card/);
  assert.match(css, /\.cert-count/);
  assert.match(css, /\.cert-trigger/);
  assert.match(css, /\.cert-modal/);
  assert.match(css, /\.cert-list/);
  assert.match(css, /\.proof-grid/);
  assert.match(css, /text-align: center/);
  assert.match(css, /\.goals-section/);
  assert.match(css, /\.goals-grid/);
  assert.match(css, /\.goal-card/);
  assert.match(css, /\.running-week-table/);
  assert.match(css, /\.race-pr-table/);
  assert.match(css, /\.evidence-modal/);
  assert.match(css, /\.focus-modal/);
  assert.match(css, /\.infosec-section/);
  assert.match(css, /@media \(max-width: 760px\)/);
});
