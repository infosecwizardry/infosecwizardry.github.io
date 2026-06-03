(function () {
  "use strict";

  const SCRIPT_URL = (document.currentScript && document.currentScript.src) || "";
  const FOCUS_URL = new URL("../data/focus-areas.json", SCRIPT_URL).href;
  const EXP_URL = new URL("../data/experience.json", SCRIPT_URL).href;
  const CERTS_URL = new URL("../data/certifications-held.json", SCRIPT_URL).href;

  const GITHUB_USERNAME = "infosecwizardry";

  let cache = null;

  function escapeHtml(value) {
    if (window.Recommendations && window.Recommendations.escapeHtml) {
      return window.Recommendations.escapeHtml(value);
    }
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error("Fetch failed " + res.status + " for " + url);
    return res.json();
  }

  async function fetchRepos() {
    try {
      const res = await fetch(
        "https://api.github.com/users/" + GITHUB_USERNAME + "/repos?sort=updated&per_page=100"
      );
      if (!res.ok) return [];
      const repos = await res.json();
      return repos.filter(r => !r.fork && r.name !== GITHUB_USERNAME + ".github.io");
    } catch (e) {
      console.warn("GitHub repo fetch failed:", e);
      return [];
    }
  }

  async function loadAll() {
    if (cache) return cache;
    const [focusData, expData, certData, repos, recs] = await Promise.all([
      fetchJson(FOCUS_URL),
      fetchJson(EXP_URL).catch(() => ({ positions: [] })),
      fetchJson(CERTS_URL).catch(() => ({ certs: [] })),
      fetchRepos(),
      (window.Recommendations && window.Recommendations.loadRecommendations)
        ? window.Recommendations.loadRecommendations().catch(() => [])
        : Promise.resolve([])
    ]);
    cache = {
      areas: (focusData && focusData.areas) || [],
      positions: (expData && expData.positions) || [],
      certs: (certData && certData.certs) || [],
      repos: repos || [],
      recs: recs || []
    };
    return cache;
  }

  function areaBySlug(data, slug) {
    return data.areas.find(a => a.slug === slug) || null;
  }

  function positionsForArea(data, slug) {
    return data.positions
      .map(pos => {
        const matchingBullets = (pos.bullets || []).filter(
          b => Array.isArray(b.focusAreas) && b.focusAreas.includes(slug)
        );
        if (!matchingBullets.length) return null;
        return Object.assign({}, pos, { bullets: matchingBullets });
      })
      .filter(Boolean);
  }

  function certsForArea(data, slug) {
    return data.certs.filter(c => Array.isArray(c.focusAreas) && c.focusAreas.includes(slug));
  }

  function reposForArea(data, slug) {
    const area = areaBySlug(data, slug);
    if (!area) return [];
    const aliases = new Set((area.githubTopicAliases || []).map(t => t.toLowerCase()));
    aliases.add(slug.toLowerCase());
    return data.repos.filter(repo => {
      const topics = (repo.topics || []).map(t => String(t).toLowerCase());
      return topics.some(t => aliases.has(t));
    });
  }

  function recsForArea(data, slug) {
    return data.recs.filter(item =>
      (item.tags || []).some(t => String(t).toLowerCase() === slug.toLowerCase())
    );
  }

  function getItemsForArea(data, slug) {
    return {
      experience: positionsForArea(data, slug),
      certifications: certsForArea(data, slug),
      projects: reposForArea(data, slug),
      recommendations: recsForArea(data, slug)
    };
  }

  function totalItems(groups) {
    return groups.experience.length + groups.certifications.length +
      groups.projects.length + groups.recommendations.length;
  }

  function formatDateRange(startDate, endDate) {
    const fmt = (s) => {
      if (!s) return "";
      const [y, m] = s.split("-");
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const monthName = (m && months[parseInt(m, 10) - 1]) || "";
      return monthName ? monthName + " " + y : y;
    };
    return fmt(startDate) + " – " + (endDate ? fmt(endDate) : "Present");
  }

  // ---------- Renderers ----------

  function renderPositionCard(pos, showAllTags) {
    const bullets = (pos.bullets || []).map(b => {
      const tags = (b.focusAreas || [])
        .map(slug => `<span class="pill bullet-tag" data-area="${escapeHtml(slug)}">${escapeHtml(slug)}</span>`)
        .join("");
      const tagRow = (showAllTags && tags) ? `<div class="bullet-tags">${tags}</div>` : "";
      return `<li>${escapeHtml(b.text)}${tagRow}</li>`;
    }).join("");
    return `
      <article class="card position-card">
        <div class="position-head">
          <h3>${escapeHtml(pos.title)}</h3>
          <div class="position-meta">${escapeHtml(pos.company)} &middot; ${escapeHtml(formatDateRange(pos.startDate, pos.endDate))}</div>
        </div>
        <ul class="position-bullets">${bullets}</ul>
      </article>
    `;
  }

  function renderCertBadge(cert) {
    return `
      <div class="cert-badge">
        <div class="cert-logo"><img src="${escapeHtml(cert.logo)}" alt="${escapeHtml(cert.name)}"></div>
        <div class="cert-copy">
          <div class="cert-title">${escapeHtml(cert.name)}</div>
          <div class="cert-provider">${escapeHtml(cert.provider || "")}</div>
        </div>
      </div>
    `;
  }

  function renderRepoCard(repo) {
    const language = repo.language ? escapeHtml(repo.language) : "Code Project";
    const updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric"
    }) : "";
    const topics = (repo.topics || []).slice(0, 4)
      .map(t => `<span class="pill">${escapeHtml(t)}</span>`).join("");
    return `
      <article class="card">
        <div class="project-top">
          <div>
            <h3>${escapeHtml(repo.name)}</h3>
            <div class="repo-meta">${language}${updated ? " &middot; Updated " + escapeHtml(updated) : ""}</div>
          </div>
          <div class="repo-meta">&#9733; ${repo.stargazers_count || 0}</div>
        </div>
        <p>${escapeHtml(repo.description || "Project description coming soon.")}</p>
        <div class="pill-row">${topics || '<span class="pill">GitHub</span>'}</div>
        <div class="project-links">
          <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">View Repo</a>
          ${repo.homepage ? `<a href="${escapeHtml(repo.homepage)}" target="_blank" rel="noreferrer">Live Demo</a>` : ""}
        </div>
      </article>
    `;
  }

  function renderRecCard(item) {
    if (window.Recommendations && window.Recommendations.renderCard) {
      return window.Recommendations.renderCard(item);
    }
    return `<article class="card"><h3>${escapeHtml(item.title || "")}</h3></article>`;
  }

  function renderGroup(title, html, modifierClass) {
    if (!html) return "";
    return `
      <section class="focus-modal-group ${modifierClass || ""}">
        <h3 class="focus-modal-group-title">${escapeHtml(title)}</h3>
        ${html}
      </section>
    `;
  }

  // ---------- Public API ----------

  async function renderFocusAreaPills(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let data;
    try {
      data = await loadAll();
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Could not load focus areas.</div>`;
      console.error(e);
      return;
    }
    const html = data.areas
      .map(area => {
        const groups = getItemsForArea(data, area.slug);
        const count = totalItems(groups);
        if (count === 0) return null;
        return `<button type="button" class="pill pill-clickable" data-area="${escapeHtml(area.slug)}" aria-haspopup="dialog">${escapeHtml(area.label)}</button>`;
      })
      .filter(Boolean)
      .join("");
    container.innerHTML = html || `<div class="empty-state">No focus areas have supporting content yet.</div>`;

    container.querySelectorAll(".pill-clickable").forEach(btn => {
      btn.addEventListener("click", () => openModalForArea(btn.getAttribute("data-area")));
    });
  }

  async function renderCertMarquee(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let data;
    try {
      data = await loadAll();
    } catch (e) {
      console.error(e);
      return;
    }
    const badges = data.certs.map(renderCertBadge).join("");
    // Duplicate for the smooth infinite scroll loop (matches CSS animation)
    container.innerHTML = badges + badges;
  }

  function renderCollapsiblePosition(pos) {
    const bullets = (pos.bullets || [])
      .map(b => `<li>${escapeHtml(b.text)}</li>`)
      .join("");
    return `
      <article class="card position-card position-collapsible" data-position-id="${escapeHtml(pos.id || "")}">
        <div class="position-head">
          <h3>${escapeHtml(pos.title)}</h3>
          <div class="position-meta">${escapeHtml(pos.company)} &middot; ${escapeHtml(formatDateRange(pos.startDate, pos.endDate))}</div>
        </div>
        <div class="position-body">
          <ul class="position-bullets">${bullets}</ul>
        </div>
        <button type="button" class="position-toggle" aria-expanded="false">
          <span class="position-toggle-label">Click to see more</span>
          <span class="position-toggle-icon" aria-hidden="true">&#x25BC;</span>
        </button>
      </article>
    `;
  }

  function sortPositionsReverseChrono(positions) {
    // Reverse-chronological: ongoing roles (endDate=null) first by startDate desc,
    // then completed roles by endDate desc.
    return positions.slice().sort((a, b) => {
      const aEnd = a.endDate || "9999-99";
      const bEnd = b.endDate || "9999-99";
      if (aEnd !== bEnd) return bEnd.localeCompare(aEnd);
      return (b.startDate || "").localeCompare(a.startDate || "");
    });
  }

  async function renderExperienceSummary(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let data;
    try {
      data = await loadAll();
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Could not load experience.</div>`;
      console.error(e);
      return;
    }
    if (!data.positions.length) {
      container.innerHTML = `<div class="empty-state">Experience details coming soon.</div>`;
      return;
    }

    const ordered = sortPositionsReverseChrono(data.positions);
    container.innerHTML = ordered.map(renderCollapsiblePosition).join("");

    container.querySelectorAll(".position-collapsible").forEach(card => {
      const toggle = card.querySelector(".position-toggle");
      const label = toggle.querySelector(".position-toggle-label");
      toggle.addEventListener("click", () => {
        const expanded = card.classList.toggle("expanded");
        toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
        label.textContent = expanded ? "Click to see less" : "Click to see more";
      });
    });
  }

  async function renderResumePage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let data;
    try {
      data = await loadAll();
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Could not load resume.</div>`;
      console.error(e);
      return;
    }
    if (!data.positions.length) {
      container.innerHTML = `<div class="empty-state">Resume content coming soon.</div>`;
      return;
    }
    container.innerHTML = data.positions.map(pos => renderPositionCard(pos, false)).join("");
  }

  async function openModalForArea(slug) {
    const modal = document.getElementById("focus-area-modal");
    const titleEl = document.getElementById("focus-modal-title");
    const bodyEl = document.getElementById("focus-modal-body");
    if (!modal || !titleEl || !bodyEl) return;

    let data;
    try {
      data = await loadAll();
    } catch (e) {
      console.error(e);
      return;
    }
    const area = areaBySlug(data, slug);
    if (!area) return;
    const groups = getItemsForArea(data, slug);

    titleEl.textContent = area.label;

    const expHtml = groups.experience.length
      ? `<div class="focus-modal-stack">${groups.experience.map(p => renderPositionCard(p, false)).join("")}</div>`
      : "";

    const certHtml = groups.certifications.length
      ? `<div class="focus-modal-cert-row">${groups.certifications.map(renderCertBadge).join("")}</div>`
      : "";

    const projHtml = groups.projects.length
      ? `<div class="grid">${groups.projects.map(renderRepoCard).join("")}</div>`
      : "";

    const recHtml = groups.recommendations.length
      ? `<div class="grid">${groups.recommendations.map(renderRecCard).join("")}</div>`
      : "";

    const body =
      renderGroup("Experience", expHtml) +
      renderGroup("Certifications Earned", certHtml, "focus-modal-group-certs") +
      renderGroup("Projects", projHtml) +
      renderGroup("Recommended", recHtml);

    bodyEl.innerHTML = body || `<div class="empty-state">Nothing here yet for this focus area.</div>`;

    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
    bodyEl.scrollTop = 0;
  }

  function wireModalChrome() {
    const modal = document.getElementById("focus-area-modal");
    if (!modal) return;
    const closeBtn = modal.querySelector(".focus-modal-close");
    if (closeBtn) closeBtn.addEventListener("click", () => modal.close());

    // Click outside dialog content closes it
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });
  }

  function maybeOpenFromHash() {
    const hash = window.location.hash || "";
    const match = hash.match(/^#focus=([^&]+)/);
    if (match) {
      const slug = decodeURIComponent(match[1]);
      // Small delay to let pills render first
      setTimeout(() => openModalForArea(slug), 150);
    }
  }

  window.FocusAreas = {
    loadAll,
    getItemsForArea,
    renderFocusAreaPills,
    renderCertMarquee,
    renderExperienceSummary,
    renderResumePage,
    openModalForArea,
    wireModalChrome,
    maybeOpenFromHash
  };
})();
