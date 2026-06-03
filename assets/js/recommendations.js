(function () {
  "use strict";

  const SCRIPT_URL = (document.currentScript && document.currentScript.src) || "";
  const DATA_URL = new URL("../data/recommendations.json", SCRIPT_URL).href;
  const READING_LOG_URL = new URL("../data/reading-log.json", SCRIPT_URL).href;

  const TYPE_LABELS = {
    book: "Book",
    training: "Training",
    podcast: "Podcast",
    creator: "Creator",
    lab: "Lab",
    tool: "Tool",
    research: "Research",
    certification: "Certification",
    other: "Other"
  };

  const TYPE_LABELS_PLURAL = {
    book: "Books",
    training: "Training",
    podcast: "Podcasts",
    creator: "Creators",
    lab: "Labs",
    tool: "Tools",
    research: "Research",
    certification: "Certifications",
    other: "Other"
  };

  const TYPE_ORDER = ["book", "training", "lab", "tool", "podcast", "creator", "research", "certification", "other"];

  let cache = null;
  let readingLogCache = null;

  async function loadJson(url, errorLabel) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to load " + errorLabel + ": " + res.status);
    return res.json();
  }

  async function loadReadingLog() {
    if (readingLogCache) return readingLogCache;
    const data = await loadJson(READING_LOG_URL, "reading log");
    readingLogCache = Array.isArray(data.items) ? data.items : [];
    return readingLogCache;
  }

  function normalizeReadingLogBook(item) {
    return {
      id: item.id,
      type: "book",
      title: item.title,
      author: item.author,
      description: item.description,
      category: item.category,
      review: item.review,
      link: item.link,
      tags: Array.isArray(item.tags) ? item.tags : [],
      finishedDate: item.finishedDate || "",
      rating: item.rating || "",
      recommended: Boolean(item.recommended),
      status: item.status || ""
    };
  }

  async function loadRecommendations() {
    if (cache) return cache;
    const [recommendationData, readingLogItems] = await Promise.all([
      loadJson(DATA_URL, "recommendations"),
      loadReadingLog()
    ]);
    const nonBookItems = (Array.isArray(recommendationData.items) ? recommendationData.items : [])
      .filter(item => String(item.type || "").toLowerCase() !== "book");
    const recommendedBooks = readingLogItems
      .filter(item => Boolean(item.recommended))
      .map(normalizeReadingLogBook);
    cache = nonBookItems.concat(recommendedBooks);
    return cache;
  }

  function escapeHtml(value) {
    if (value == null) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderCard(item) {
    const typeKey = String(item.type || "other").toLowerCase();
    const typeLabel = TYPE_LABELS[typeKey] || TYPE_LABELS.other;
    const author = item.author
      ? `<div class="rec-card-author">${escapeHtml(item.author)}</div>`
      : "";
    const category = item.category
      ? `<div class="rec-card-meta"><span class="pill">${escapeHtml(item.category)}</span></div>`
      : "";
    const tags = (item.tags || [])
      .map(tag => `<span class="pill">${escapeHtml(tag)}</span>`)
      .join("");
    const tagRow = tags ? `<div class="pill-row">${tags}</div>` : "";
    const review = item.review
      ? `<div class="rec-review"><strong>My take:</strong> ${escapeHtml(item.review)}</div>`
      : "";
    const link = item.link
      ? `<div class="project-links"><a class="resource-link" href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">View ${escapeHtml(typeLabel)} &rarr;</a></div>`
      : "";

    return `
      <article class="card rec-card">
        <span class="type-pill type-${escapeHtml(typeKey)}">${escapeHtml(typeLabel)}</span>
        <h3>${escapeHtml(item.title || "Untitled")}</h3>
        ${author}
        ${category}
        <p>${escapeHtml(item.description || "")}</p>
        ${review}
        ${tagRow}
        ${link}
      </article>
    `;
  }

  function renderEmpty(message) {
    return `<div class="empty-state">${escapeHtml(message)}</div>`;
  }

  function renderInto(containerId, items, emptyMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!items.length) {
      container.innerHTML = renderEmpty(emptyMessage || "Nothing here yet — check back soon.");
      return;
    }
    container.innerHTML = items.map(renderCard).join("");
  }

  async function safeLoad(containerId) {
    try {
      return await loadRecommendations();
    } catch (err) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = renderEmpty("Could not load recommendations. Please refresh.");
      }
      console.error(err);
      return null;
    }
  }

  async function renderByType(containerId, types) {
    const items = await safeLoad(containerId);
    if (!items) return;
    const typeSet = new Set((Array.isArray(types) ? types : [types]).map(t => String(t).toLowerCase()));
    const filtered = items.filter(item => typeSet.has(String(item.type || "").toLowerCase()));
    renderInto(containerId, filtered, "Nothing in this category yet.");
  }

  async function renderByTag(containerId, tag, opts) {
    const items = await safeLoad(containerId);
    if (!items) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const extraLinks = (opts && Array.isArray(opts.extraLinks)) ? opts.extraLinks : [];
    const target = String(tag).toLowerCase();
    const filtered = items.filter(item =>
      (item.tags || []).some(t => String(t).toLowerCase() === target)
    );

    if (!filtered.length && !extraLinks.length) {
      container.innerHTML = renderEmpty("No recommendations tagged for this role yet.");
      return;
    }

    const grouped = {};
    filtered.forEach(item => {
      const type = String(item.type || "other").toLowerCase();
      (grouped[type] = grouped[type] || []).push(item);
    });

    const presentTypes = TYPE_ORDER.filter(t => grouped[t]);
    Object.keys(grouped).forEach(t => {
      if (!presentTypes.includes(t)) presentTypes.push(t);
    });

    const jumpButtons = presentTypes.map(type => {
      const label = TYPE_LABELS_PLURAL[type] || TYPE_LABELS[type] || type;
      const anchor = containerId + "-" + type;
      return `<a class="rec-jump-btn" href="#${anchor}">${escapeHtml(label)}</a>`;
    }).join("");

    const extraButtons = extraLinks.map(link => {
      const label = escapeHtml(link.label || "");
      const href = escapeHtml(link.href || "#");
      return `<a class="rec-jump-btn rec-jump-btn-external" href="${href}">${label} <span aria-hidden="true">&#8599;</span></a>`;
    }).join("");

    const sections = presentTypes.map(type => {
      const label = TYPE_LABELS_PLURAL[type] || TYPE_LABELS[type] || type;
      const anchor = containerId + "-" + type;
      const cards = grouped[type].map(renderCard).join("");
      return `
        <div class="rec-subsection">
          <h3 id="${anchor}" class="rec-subsection-title">${escapeHtml(label)}</h3>
          <div class="grid">${cards}</div>
        </div>
      `;
    }).join("");

    container.innerHTML =
      `<div class="rec-jump-row">${jumpButtons}${extraButtons}</div>` + sections;
  }

  async function renderByTagAndType(containerId, tag, types) {
    const items = await safeLoad(containerId);
    if (!items) return;
    const target = String(tag).toLowerCase();
    const typeSet = new Set((Array.isArray(types) ? types : [types]).map(t => String(t).toLowerCase()));
    const filtered = items.filter(item =>
      typeSet.has(String(item.type || "").toLowerCase()) &&
      (item.tags || []).some(t => String(t).toLowerCase() === target)
    );
    renderInto(containerId, filtered, "Nothing tagged here yet.");
  }

  window.Recommendations = {
    loadRecommendations,
    loadReadingLog,
    renderByType,
    renderByTag,
    renderByTagAndType,
    renderCard,
    escapeHtml
  };
})();
