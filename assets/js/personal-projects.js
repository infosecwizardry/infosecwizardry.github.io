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

  function renderGoals(goals) {
    if (!goals || !goals.length) return "";
    const items = goals.map(g => `<li>${escapeHtml(g)}</li>`).join("");
    return `
      <div class="personal-goals">
        <div class="personal-goals-label">Goals</div>
        <ul>${items}</ul>
      </div>
    `;
  }

  function renderLink(link) {
    if (!link || !link.url) return "";
    const label = escapeHtml(link.label || "Link");
    return `<div class="project-links"><a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${label} &rarr;</a></div>`;
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
            ${b.note ? `<p class="book-note">${escapeHtml(b.note)}</p>` : ""}
          </div>
        `).join("")}</div>`
      : `<p class="muted-note"><em>Nothing logged right now &mdash; add the current title to personal-projects.json.</em></p>`;
    return `
      <article class="card personal-card">
        <h3>${escapeHtml(item.title)}</h3>
        ${bookBlock}
      </article>
    `;
  }

  function renderRunningCard(item) {
    const m = item.mileage || {};
    const stats = [];
    if (m.thisWeek) {
      stats.push(`<div><span class="stat-label">This week</span><span class="stat-value">${escapeHtml(m.thisWeek)} mi</span></div>`);
    }
    if (m.ytd) {
      stats.push(`<div><span class="stat-label">YTD</span><span class="stat-value">${escapeHtml(m.ytd)} mi</span></div>`);
    }
    const statsBlock = stats.length
      ? `<div class="personal-stats">${stats.join("")}</div>${m.lastUpdated ? `<p class="muted-note">Updated ${escapeHtml(m.lastUpdated)}</p>` : ""}`
      : "";
    return `
      <article class="card personal-card">
        <h3>${escapeHtml(item.title)}</h3>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
        ${statsBlock}
        ${renderGoals(item.goals)}
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
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Could not load personal projects.</div>`;
      console.error(e);
    }
  }

  window.PersonalProjects = { render };
})();
