(function () {
  "use strict";

  const SCRIPT_URL = (document.currentScript && document.currentScript.src) || "";
  const DATA_URL = new URL("../data/personal-projects.json", SCRIPT_URL).href;

  function escapeHtml(value) {
    if (window.Recommendations && window.Recommendations.escapeHtml) {
      return window.Recommendations.escapeHtml(value);
    }
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function renderGoals(goals, opts) {
    if (!goals || !goals.length) return "";
    const clickAction = opts && opts.clickAction;
    const labelHtml = clickAction
      ? `Goals <span class="personal-goals-hint">(click to view progress)</span>`
      : "Goals";
    const items = goals.map(g => {
      if (clickAction) {
        return `<li><button type="button" class="personal-goal-btn" data-action="${escapeHtml(clickAction)}">
          <span class="personal-goal-text">${escapeHtml(g)}</span>
          <span class="personal-goal-chevron" aria-hidden="true">&rsaquo;</span>
        </button></li>`;
      }
      return `<li>${escapeHtml(g)}</li>`;
    }).join("");
    return `
      <div class="personal-goals${clickAction ? " clickable" : ""}">
        <div class="personal-goals-label">${labelHtml}</div>
        <ul>${items}</ul>
      </div>
    `;
  }

  function formatWeekEnding(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function sortWeeksDesc(weeks) {
    return (weeks || []).slice().sort((a, b) =>
      (b.weekEnding || "").localeCompare(a.weekEnding || "")
    );
  }

  function ensureRunningModal() {
    if (document.getElementById("running-stats-modal")) return;
    const dlg = document.createElement("dialog");
    dlg.id = "running-stats-modal";
    dlg.className = "focus-modal";
    dlg.setAttribute("aria-labelledby", "running-stats-title");
    dlg.innerHTML = `
      <div class="focus-modal-header">
        <h2 id="running-stats-title">Running Stats</h2>
        <form method="dialog" class="focus-modal-close-form">
          <button class="focus-modal-close" aria-label="Close">Close</button>
        </form>
      </div>
      <div id="running-stats-body" class="focus-modal-body"></div>
    `;
    document.body.appendChild(dlg);
    dlg.addEventListener("click", (event) => {
      if (event.target === dlg) dlg.close();
    });
  }

  function renderWeeklyMileageSection(item) {
    const weeks = sortWeeksDesc(item.weeklyMileage);
    const totalLogged = weeks.reduce((sum, w) => sum + (Number(w.miles) || 0), 0);
    const rows = weeks.length
      ? weeks.map(w => `
          <tr>
            <td>${escapeHtml(formatWeekEnding(w.weekEnding))}</td>
            <td>${escapeHtml(String(w.miles))} mi</td>
          </tr>
        `).join("")
      : `<tr><td colspan="2" class="muted-note"><em>No weekly mileage logged yet.</em></td></tr>`;
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

  function renderUltraSection(item) {
    const lr = item.longestRun || {};
    const hasMiles = lr.miles != null && lr.miles !== "";
    const content = hasMiles
      ? `<div class="running-stat-row">
          <div>
            <div class="stat-label">Longest run so far</div>
            <div class="stat-value-big">${escapeHtml(String(lr.miles))} mi</div>
            ${lr.date ? `<div class="muted-note">${escapeHtml(formatWeekEnding(lr.date))}</div>` : ""}
          </div>
          <div>
            <div class="stat-label">Target</div>
            <div class="stat-value-big stat-target">60 mi</div>
          </div>
        </div>`
      : `<p class="muted-note"><em>No long run logged yet. The first one toward the 60-mile target is coming.</em></p>`;
    return `
      <section class="focus-modal-group">
        <h3 class="focus-modal-group-title">60 Mile Ultra Marathon</h3>
        ${content}
      </section>
    `;
  }

  function renderPRSection(item) {
    const prs = Array.isArray(item.racePRs) ? item.racePRs : [];
    if (!prs.length) return "";
    const rows = prs.map(pr => {
      const hasTime = pr.time && String(pr.time).trim();
      return `
        <tr>
          <td>${escapeHtml(pr.distance || "")}</td>
          <td>${hasTime ? escapeHtml(pr.time) : '<span class="muted-note">Not logged yet</span>'}</td>
          <td class="race-target">${pr.target ? escapeHtml(pr.target) : "&mdash;"}</td>
          <td>${pr.date ? escapeHtml(formatWeekEnding(pr.date)) : "&mdash;"}</td>
        </tr>
      `;
    }).join("");
    return `
      <section class="focus-modal-group">
        <h3 class="focus-modal-group-title">Sub-3 Hour Marathon (Boston Qualifier)</h3>
        <table class="race-pr-table">
          <thead><tr><th>Distance</th><th>PR</th><th>Target</th><th>Date</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    `;
  }

  function openRunningStats(item) {
    ensureRunningModal();
    const dlg = document.getElementById("running-stats-modal");
    const body = document.getElementById("running-stats-body");

    body.innerHTML =
      renderWeeklyMileageSection(item) +
      renderUltraSection(item) +
      renderPRSection(item);

    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
  }

  function renderLink(link) {
    if (!link || !link.url) return "";
    const label = escapeHtml(link.label || "Link");
    const href = escapeHtml(link.url);
    const isExternal = /^[a-z][a-z0-9+.-]*:|^\/\//i.test(link.url);
    const targetAttrs = isExternal ? ` target="_blank" rel="noreferrer"` : "";
    return `<div class="project-links"><a href="${href}"${targetAttrs}>${label} &rarr;</a></div>`;
  }

  function renderContentCard(item) {
    return `
      <article class="card personal-card">
        <h3>${escapeHtml(item.title)}</h3>
        ${item.tagline ? `<p class="personal-tagline">${escapeHtml(item.tagline)}</p>` : ""}
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
        ${renderGoals(item.goals)}
        ${renderLink(item.link)}
      </article>
    `;
  }

  function renderBookCard(item) {
    const books = Array.isArray(item.books) ? item.books.filter(b => b && (b.title || "").trim()) : [];
    const bookBlock = books.length
      ? `<div class="book-list">${books.map(b => `
          <div class="book-entry">
            <p class="book-title">${escapeHtml(b.title)}</p>
            ${b.author ? `<p class="book-author">by ${escapeHtml(b.author)}</p>` : ""}
            ${renderBookMeta(b)}
            ${b.note ? `<p class="book-note">${escapeHtml(b.note)}</p>` : ""}
          </div>
        `).join("")}</div>`
      : `<p class="muted-note"><em>Nothing logged right now &mdash; add the current title to personal-projects.json.</em></p>`;
    return `
      <article class="card personal-card">
        <h3>${escapeHtml(item.title)}</h3>
        ${bookBlock}
        ${renderLink(item.link)}
      </article>
    `;
  }

  function renderBookMeta(book) {
    const badges = [];
    if (book.category) badges.push(`<span class="book-badge">${escapeHtml(book.category)}</span>`);
    if (Array.isArray(book.tags)) {
      book.tags
        .filter(tag => tag && String(tag).trim())
        .forEach(tag => badges.push(`<span class="book-badge">${escapeHtml(tag)}</span>`));
    }
    return badges.length ? `<div class="book-meta">${badges.join("")}</div>` : "";
  }

  function renderRunningCard(item) {
    const m = item.mileage || {};
    const weeks = sortWeeksDesc(item.weeklyMileage);
    const latest = weeks[0];
    const stats = [];
    if (latest) {
      stats.push(`<div><span class="stat-label">Last week</span><span class="stat-value">${escapeHtml(String(latest.miles))} mi</span></div>`);
    }
    if (m.ytd) {
      stats.push(`<div><span class="stat-label">YTD</span><span class="stat-value">${escapeHtml(m.ytd)} mi</span></div>`);
    }
    const statsBlock = stats.length
      ? `<div class="personal-stats">${stats.join("")}</div>${m.lastUpdated ? `<p class="muted-note">Updated ${escapeHtml(m.lastUpdated)}</p>` : ""}`
      : "";
    const viewStatsBtn = `<button type="button" class="personal-action-btn" data-action="open-running-stats">
      <span>View running stats</span>
      <span class="personal-goal-chevron" aria-hidden="true">&rsaquo;</span>
    </button>`;
    return `
      <article class="card personal-card" data-personal-id="${escapeHtml(item.id)}">
        <h3>${escapeHtml(item.title)}</h3>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
        ${statsBlock}
        ${renderGoals(item.goals)}
        ${viewStatsBtn}
        ${renderLink(item.link)}
      </article>
    `;
  }

  const RENDERERS = {
    content: renderContentCard,
    book: renderBookCard,
    running: renderRunningCard
  };

  async function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
      const res = await fetch(DATA_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error("Failed to load: " + res.status);
      const data = await res.json();
      const items = (data && data.items) || [];
      if (!items.length) {
        container.innerHTML = `<div class="empty-state">No personal projects yet.</div>`;
        return;
      }
      container.innerHTML = items.map(item => {
        const renderer = RENDERERS[item.type] || renderContentCard;
        return renderer(item);
      }).join("");

      container.querySelectorAll('[data-action="open-running-stats"]').forEach(btn => {
        btn.addEventListener("click", () => {
          const card = btn.closest("[data-personal-id]");
          const id = card && card.getAttribute("data-personal-id");
          const runningItem = items.find(i => i.id === id);
          if (runningItem) openRunningStats(runningItem);
        });
      });
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Could not load personal projects.</div>`;
      console.error(e);
    }
  }

  window.PersonalProjects = { render };
})();
