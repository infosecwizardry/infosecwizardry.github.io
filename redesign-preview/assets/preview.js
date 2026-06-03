(function () {
  "use strict";

  const SCRIPT_URL = (document.currentScript && document.currentScript.src) || "";
  const CERTIFICATIONS_URL = new URL("../../assets/data/certifications-held.json", SCRIPT_URL).href;
  const PERSONAL_PROJECTS_URL = new URL("../../assets/data/personal-projects.json", SCRIPT_URL).href;

  const EVIDENCE = {
    operate: {
      title: "Make SOC work more reliable",
      metrics: [
        {
          value: "10+",
          label: "major initiatives delivered after project and ownership rebuild."
        },
        {
          value: "3 weeks",
          label: "formal threat-hunting cadence built from ad hoc hunts."
        },
        {
          value: "66%+",
          label: "average open-to-close time reduction after delivery standardization."
        }
      ],
      proofs: [
        "Rebuilt detection operations from alert-by-alert workflows into a risk-based strategy using host, network, and cloud telemetry review.",
        "Created operating standards through investigation standards, runbooks, and playbook-driven workflows across SOC, detection, hunting, malware, and forensics.",
        "Unblocked delivery by moving stalled security operations projects through completion with clearer ownership, dependencies, and milestones."
      ]
    },
    detect: {
      title: "Build detections teams can trust",
      metrics: [
        {
          value: "Weeks to hours",
          label: "detection drift discovery through dashboards, alerts, and executive metrics."
        },
        {
          value: "Multi-source",
          label: "telemetry correlated across endpoint, cloud, SIEM, SQL, and data platforms."
        },
        {
          value: "Attack variants",
          label: "controlled tests used to expose gaps and drive detection fixes."
        }
      ],
      proofs: [
        "Built detection health monitoring that exposed drift, broken logic, telemetry gaps, and control degradation before changes degraded production quality.",
        "Turned attack runs into detection work by executing controlled attack variations, comparing what defenders could actually see, and turning gaps into concrete detection, logging, and telemetry improvements.",
        "Closed hard visibility gaps in Active Directory attacks, load-balanced traffic, and domain fronting."
      ]
    },
    respond: {
      title: "Turn incidents into decisions",
      metrics: [
        {
          value: "66%+",
          label: "average open-to-close time reduction after workflow rebuild."
        },
        {
          value: "After-action loop",
          label: "findings converted into training, workflows, playbooks, and standards."
        },
        {
          value: "2x+",
          label: "investigation bench expanded through analyst-to-IR development."
        }
      ],
      proofs: [
        "Led major investigations as incident commander and analyst for advanced persistent threat, nation-state, and multi-stage intrusion activity.",
        "Built an improvement pipeline that converted investigation misses and post-incident findings into updated training, workflows, playbooks, and standards so investigations became more thorough and open-to-close time dropped by more than 50%.",
        "Built response capacity through onboarding and analyst growth programs that made more people ready to support investigations without lowering investigation quality."
      ]
    },
    validate: {
      title: "Prove defenses against real behavior",
      metrics: [
        {
          value: "30-46",
          label: "analysts per quarter put through realistic end-to-end incidents."
        },
        {
          value: "Top threats",
          label: "validation mapped to financial-sector threat actors with CTI."
        },
        {
          value: "Custom C2",
          label: "hands-on-keyboard emulation built when commercial tooling could not provide it."
        }
      ],
      proofs: [
        "Scaled a custom AWS AMI-based detection assurance platform by shaping technical vision, cross-team execution, and adoption strategy.",
        "Built hands-on-keyboard emulation by extending Mandiant Security Validation with custom command-and-control tooling so analysts could investigate realistic operator behavior the commercial platform could not simulate.",
        "Made validation threat-informed by partnering with CTI to test coverage against top financial-sector threat actors and report coverage to senior leadership."
      ]
    }
  };

  let certificationsCache = null;
  let personalProjectsCache = null;

  function escapeHtml(value) {
    if (window.Recommendations && window.Recommendations.escapeHtml) {
      return window.Recommendations.escapeHtml(value);
    }
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatWeekEnding(iso) {
    if (!iso) return "";
    const date = new Date(iso + "T00:00:00");
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function sortWeeksDesc(weeks) {
    return (weeks || []).slice().sort((a, b) =>
      String(b.weekEnding || "").localeCompare(String(a.weekEnding || ""))
    );
  }

  async function loadPersonalProjects() {
    if (personalProjectsCache) return personalProjectsCache;
    const response = await fetch(PERSONAL_PROJECTS_URL, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("Failed to load personal projects: " + response.status);
    }
    const data = await response.json();
    personalProjectsCache = Array.isArray(data.items) ? data.items : [];
    return personalProjectsCache;
  }

  function renderWeeklyMileage(item) {
    const weeks = sortWeeksDesc(item.weeklyMileage);
    const totalLogged = weeks.reduce((sum, week) => sum + (Number(week.miles) || 0), 0);
    const rows = weeks.length
      ? weeks.map((week) => `
          <tr>
            <td>${escapeHtml(formatWeekEnding(week.weekEnding))}</td>
            <td>${escapeHtml(String(week.miles))} mi</td>
          </tr>
        `).join("")
      : `<tr><td colspan="2" class="muted-note">No weekly mileage logged yet.</td></tr>`;
    const totalsRow = weeks.length
      ? `<tfoot><tr><td>Total logged (${weeks.length} ${weeks.length === 1 ? "week" : "weeks"})</td><td>${totalLogged.toFixed(1)} mi</td></tr></tfoot>`
      : "";

    return `
      <section class="focus-modal-group">
        <h3 class="focus-modal-group-title">Weekly Mileage</h3>
        <table class="running-week-table">
          <thead><tr><th>Week ending</th><th>Miles</th></tr></thead>
          <tbody>${rows}</tbody>
          ${totalsRow}
        </table>
      </section>
    `;
  }

  function renderEnduranceTargets(item) {
    const goals = Array.isArray(item.goals) ? item.goals : [];
    const goalItems = goals.length
      ? goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join("")
      : `<li>No active endurance goals logged.</li>`;
    const longestRun = item.longestRun || {};
    const longestRunHtml = longestRun.miles
      ? `<p class="running-log-note">Longest run logged: <strong>${escapeHtml(String(longestRun.miles))} mi</strong>${longestRun.date ? ` on ${escapeHtml(formatWeekEnding(longestRun.date))}` : ""}.</p>`
      : `<p class="running-log-note">Longest run is not logged yet.</p>`;

    return `
      <section class="focus-modal-group">
        <h3 class="focus-modal-group-title">Endurance Goals</h3>
        <ul class="running-goal-list">${goalItems}</ul>
        ${longestRunHtml}
      </section>
    `;
  }

  function renderRaceTargets(item) {
    const racePrs = Array.isArray(item.racePRs) ? item.racePRs : [];
    if (!racePrs.length) return "";
    const rows = racePrs.map((race) => `
      <tr>
        <td>${escapeHtml(race.distance || "")}</td>
        <td>${race.time ? escapeHtml(race.time) : `<span class="muted-note">Not logged yet</span>`}</td>
        <td class="race-target">${race.target ? escapeHtml(race.target) : "&mdash;"}</td>
        <td>${race.date ? escapeHtml(formatWeekEnding(race.date)) : "&mdash;"}</td>
      </tr>
    `).join("");

    return `
      <section class="focus-modal-group">
        <h3 class="focus-modal-group-title">Race Targets</h3>
        <table class="race-pr-table">
          <thead><tr><th>Distance</th><th>Current PR</th><th>Target</th><th>Date</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    `;
  }

  function renderRunningLog(item) {
    return renderWeeklyMileage(item) + renderEnduranceTargets(item) + renderRaceTargets(item);
  }

  function renderMetrics(metrics) {
    return metrics.map((metric) => `
      <article class="evidence-metric">
        <strong>${escapeHtml(metric.value)}</strong>
        <span>${escapeHtml(metric.label)}</span>
      </article>
    `).join("");
  }

  function renderProofs(proofs) {
    return proofs.map((proof) => `<li>${escapeHtml(proof)}</li>`).join("");
  }

  async function loadCertifications() {
    if (certificationsCache) return certificationsCache;
    const response = await fetch(CERTIFICATIONS_URL, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("Failed to load certifications: " + response.status);
    }
    const data = await response.json();
    certificationsCache = Array.isArray(data.certs) ? data.certs : [];
    return certificationsCache;
  }

  function formatFocusArea(slug) {
    const labels = {
      "adversary-emulation": "Adversary Emulation",
      "penetration-testing": "Penetration Testing",
      "red-teaming": "Red Teaming",
      "malware-development": "Malware Development",
      "web-application-security": "Web App Security",
      "incident-response": "Incident Response",
      "incident-command": "Incident Command",
      "threat-hunting": "Threat Hunting",
      "detection-engineering": "Detection Engineering",
      "security-operations": "Security Operations",
      "threat-intelligence": "Threat Intelligence",
      "cloud-security": "Cloud Security",
      "digital-forensics": "Digital Forensics",
      "malware-analysis": "Malware Analysis",
      "ai-ml": "AI & ML"
    };
    return labels[slug] || String(slug || "").split("-").map((part) =>
      part ? part.charAt(0).toUpperCase() + part.slice(1) : ""
    ).join(" ");
  }

  function certificationLogoUrl(logo) {
    if (!logo) return "";
    if (/^(https?:|data:|\/|\.\.\/)/.test(logo)) return logo;
    return new URL("../../" + logo, SCRIPT_URL).href;
  }

  function renderCertification(cert) {
    const focusTags = (cert.focusAreas || []).slice(0, 4).map((slug) =>
      `<span>${escapeHtml(formatFocusArea(slug))}</span>`
    ).join("");
    const logoUrl = certificationLogoUrl(cert.logo);
    return `
      <article class="cert-full-card">
        <div class="cert-logo">
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(cert.name || "Certification")} logo">` : ""}
        </div>
        <div class="cert-copy">
          <div class="cert-title">${escapeHtml(cert.name || "Certification")}</div>
          <div class="cert-provider">${escapeHtml(cert.provider || "")}</div>
          ${focusTags ? `<div class="cert-focus-row">${focusTags}</div>` : ""}
        </div>
      </article>
    `;
  }

  async function openCertificationsModal() {
    const modal = document.getElementById("certifications-modal");
    const body = document.getElementById("certifications-modal-body");
    if (!modal || !body) return;

    body.innerHTML = `<div class="empty-state">Loading certifications...</div>`;
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }

    try {
      const certs = await loadCertifications();
      body.innerHTML = certs.length
        ? `<div class="cert-list">${certs.map(renderCertification).join("")}</div>`
        : `<div class="empty-state">No certifications found.</div>`;
    } catch (error) {
      console.error(error);
      body.innerHTML = `<div class="empty-state">Could not load certifications. Please refresh.</div>`;
    }
  }

  async function openRunningLogModal() {
    const modal = document.getElementById("running-log-modal");
    const body = document.getElementById("running-log-body");
    if (!modal || !body) return;

    body.innerHTML = `<div class="empty-state">Loading run log...</div>`;
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }

    try {
      const items = await loadPersonalProjects();
      const running = items.find((item) => item.id === "running");
      body.innerHTML = running
        ? renderRunningLog(running)
        : `<div class="empty-state">No running log found.</div>`;
    } catch (error) {
      console.error(error);
      body.innerHTML = `<div class="empty-state">Could not load the run log. Please refresh.</div>`;
    }
  }

  function openEvidence(key) {
    const evidence = EVIDENCE[key];
    const modal = document.getElementById("evidence-modal");
    const title = document.getElementById("evidence-modal-title");
    const body = document.getElementById("evidence-modal-body");
    if (!evidence || !modal || !title || !body) return;

    title.textContent = evidence.title;
    body.innerHTML = `
      <div class="evidence-metrics">${renderMetrics(evidence.metrics)}</div>
      <ul class="evidence-proof-list">${renderProofs(evidence.proofs)}</ul>
    `;

    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
  }

  async function openFocusArea(slug) {
    if (!slug) return;
    if (window.FocusAreas && typeof window.FocusAreas.openModalForArea === "function") {
      await window.FocusAreas.openModalForArea(slug);
      normalizeFocusAssetPaths();
    }
  }

  function wireCapabilityCards() {
    document.querySelectorAll("[data-evidence]").forEach((card) => {
      const key = card.getAttribute("data-evidence");
      card.addEventListener("click", () => openEvidence(key));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openEvidence(key);
        }
      });
    });
  }

  function wireSignalTags() {
    document.querySelectorAll("[data-focus]").forEach((button) => {
      button.addEventListener("click", () => {
        openFocusArea(button.getAttribute("data-focus"));
      });
    });
  }

  function wireEvidenceModal() {
    const modal = document.getElementById("evidence-modal");
    if (!modal) return;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });

    modal.querySelectorAll("[data-close-evidence]").forEach((link) => {
      link.addEventListener("click", () => modal.close());
    });
  }

  function wireCertificationsModal() {
    const modal = document.getElementById("certifications-modal");
    document.querySelectorAll("[data-certifications-trigger]").forEach((button) => {
      button.addEventListener("click", openCertificationsModal);
    });
    if (!modal) return;
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });
  }

  function wireRunningLogModal() {
    const modal = document.getElementById("running-log-modal");
    document.querySelectorAll("[data-running-log-trigger]").forEach((button) => {
      button.addEventListener("click", openRunningLogModal);
    });
    if (!modal) return;
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });
  }

  function normalizeFocusAssetPaths() {
    document.querySelectorAll("#focus-area-modal img").forEach((img) => {
      const raw = img.getAttribute("src") || "";
      if (raw.startsWith("assets/")) {
        img.setAttribute("src", "../" + raw);
      }
    });
  }

  function wireFocusAssetNormalizer() {
    const body = document.getElementById("focus-modal-body");
    if (!body || typeof MutationObserver === "undefined") return;

    const observer = new MutationObserver(() => normalizeFocusAssetPaths());
    observer.observe(body, { childList: true, subtree: true });
  }

  function init() {
    wireCapabilityCards();
    wireSignalTags();
    wireEvidenceModal();
    wireCertificationsModal();
    wireRunningLogModal();
    wireFocusAssetNormalizer();

    if (window.FocusAreas) {
      if (typeof window.FocusAreas.wireModalChrome === "function") {
        window.FocusAreas.wireModalChrome();
      }
      if (typeof window.FocusAreas.maybeOpenFromHash === "function") {
        window.FocusAreas.maybeOpenFromHash();
        window.addEventListener("hashchange", window.FocusAreas.maybeOpenFromHash);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.PreviewPortfolio = {
    init,
    openEvidence,
    openFocusArea,
    openCertificationsModal,
    openRunningLogModal,
    loadCertifications,
    loadPersonalProjects,
    renderRunningLog,
    wireCapabilityCards
  };
})();
