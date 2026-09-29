// Exclusive accordion, hash, clickable plates/nodes, and a rail that
// lights from Start to the open step.
(() => {
  const board = document.querySelector(".path-board");
  const svg = document.querySelector("[data-lines]");
  const steps = [...document.querySelectorAll(".path__step[data-index]")];
  const cards = [...document.querySelectorAll(".step-card[id]")];
  const nodes = [...document.querySelectorAll(".path__node[data-goto]")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let current = null;
  let drawn = false;

  const NS = "http://www.w3.org/2000/svg";
  const EDGES = [
    { from: "n0", to: "n1", upto: 1 },
    { from: "n1", to: "n2", upto: 2 },
    { from: "n2", to: "n3", upto: 3 },
    { from: "n3", to: "ccd-l1", upto: 3, branch: "ccd-l1" },
    { from: "n3", to: "btl1", upto: 3, branch: "btl1" },
    { from: "ccd-l1", to: "n4", upto: 4, branch: "ccd-l1" },
    { from: "btl1", to: "n4", upto: 4, branch: "btl1" },
    { from: "n4", to: "nsoon", dashed: true }
  ];

  const toggleOf = (card) => card.querySelector(".step-card__toggle");
  const panelOf = (card) => document.getElementById(toggleOf(card).getAttribute("aria-controls"));

  function setOpen(card, open) {
    const panel = panelOf(card);
    toggleOf(card).setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    panel.style.height = "";
    card.classList.toggle("is-selected", open);
  }

  function paintRoute() {
    const reached = current ? Number(current.closest(".path__step").dataset.index) : -1;
    steps.forEach((step) => {
      const i = Number(step.dataset.index);
      step.classList.toggle("is-reached", i < reached);
      step.classList.toggle("is-current", i === reached);
    });
    nodes.forEach((node) => {
      node.setAttribute("aria-pressed", String(!!current && node.dataset.goto === current.id));
    });
    paintRails(reached);
  }

  function writeURL(card) {
    const url = new URL(location.href);
    url.searchParams.delete("node");
    url.hash = card ? card.id : "";
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function select(card, { scroll = false, focus = false } = {}) {
    if (current) setOpen(current, false);
    current = card;
    if (card) setOpen(card, true);
    paintRoute();
    writeURL(card);
    if (drawn) window.requestAnimationFrame(drawRails);
    if (card && scroll) card.scrollIntoView({ block: "start", behavior: reduce.matches ? "auto" : "smooth" });
    if (card && focus) toggleOf(card).focus({ preventScroll: true });
  }

  function toggle(card, opts) {
    select(current === card ? null : card, opts);
  }

  function anchorOf(id) {
    return board.querySelector(`[data-anchor="${id}"]`);
  }

  function pt(el) {
    const a = el.getBoundingClientRect();
    const b = board.getBoundingClientRect();
    const node = el.classList.contains("path__node");
    return {
      x: a.left + a.width / 2 - b.left,
      y: a.top + a.height / 2 - b.top,
      r: node ? Math.min(a.width, a.height) / 2 : 0
    };
  }

  function toward(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const inset = Math.max(from.r - 1, 0);
    return { x: from.x + (dx / len) * inset, y: from.y + (dy / len) * inset };
  }

  function elbow(a, b) {
    const p = toward(a, b);
    const q = toward(b, a);
    if (Math.abs(p.x - q.x) < 1.5) return `M${p.x} ${p.y} L${q.x} ${q.y}`;
    const midY = (p.y + q.y) / 2;
    return `M${p.x} ${p.y} L${p.x} ${midY} L${q.x} ${midY} L${q.x} ${q.y}`;
  }

  function ensureDefs() {
    if (svg.querySelector("#rail-hot")) return;
    const defs = document.createElementNS(NS, "defs");
    const g = document.createElementNS(NS, "linearGradient");
    g.setAttribute("id", "rail-hot");
    g.setAttribute("x1", "0");
    g.setAttribute("y1", "0");
    g.setAttribute("x2", "0");
    g.setAttribute("y2", "1");
    [
      ["0", "#d8beff"],
      ["0.35", "#a868e3"],
      ["0.7", "#4135c3"],
      ["1", "#3e3183"]
    ].forEach(([off, color]) => {
      const s = document.createElementNS(NS, "stop");
      s.setAttribute("offset", off);
      s.setAttribute("stop-color", color);
      g.appendChild(s);
    });
    defs.appendChild(g);
    svg.appendChild(defs);
  }

  function edgeIsHot(edge, reached) {
    if (reached < 0 || edge.dashed) return false;
    if (edge.branch) {
      if (reached > 3) return true;
      if (reached === 3 && edge.upto === 3) return current && current.id === edge.branch;
      return false;
    }
    return reached >= edge.upto;
  }

  function drawRails() {
    if (!svg || !board) return;
    ensureDefs();
    const box = board.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    svg.setAttribute("width", String(box.width));
    svg.setAttribute("height", String(box.height));

    svg.querySelectorAll("path[data-edge]").forEach((p) => p.remove());

    const reached = current ? Number(current.closest(".path__step").dataset.index) : -1;

    EDGES.forEach((edge, i) => {
      const aEl = anchorOf(edge.from);
      const bEl = anchorOf(edge.to);
      if (!aEl || !bEl) return;
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", elbow(pt(aEl), pt(bEl)));
      p.dataset.edge = String(i);
      p.style.setProperty("--i", String(i));
      if (edge.dashed) p.classList.add("is-dashed");
      if (edgeIsHot(edge, reached)) p.classList.add("is-hot");
      svg.appendChild(p);
      p.style.setProperty("--len", String(p.getTotalLength()));
      if (drawn || reduce.matches) {
        p.style.strokeDasharray = "none";
        p.style.strokeDashoffset = "0";
      }
    });
  }

  function paintRails(reached) {
    svg.querySelectorAll("path[data-edge]").forEach((p) => {
      const edge = EDGES[Number(p.dataset.edge)];
      if (!edge) return;
      p.classList.toggle("is-hot", edgeIsHot(edge, reached));
    });
  }

  cards.forEach((card) => {
    toggleOf(card).addEventListener("click", (e) => {
      e.stopPropagation();
      toggle(card);
    });
    card.addEventListener("click", (e) => {
      if (e.target.closest("a, .step-card__more, .step-card__toggle")) return;
      toggle(card);
    });
  });

  nodes.forEach((node) => {
    node.addEventListener("click", () => {
      const card = cards.find((c) => c.id === node.dataset.goto);
      if (card) toggle(card, { scroll: true, focus: true });
    });
  });

  function cardFromLocation() {
    const hashId = location.hash.replace(/^#/, "");
    const queryId = new URLSearchParams(location.search).get("node");
    return cards.find((card) => card.id === hashId) || cards.find((card) => card.id === queryId) || null;
  }

  function openFromLocation({ scroll = false } = {}) {
    const linked = cardFromLocation();
    if (linked === current) return;
    select(linked, { scroll: !!linked && scroll, focus: false });
  }

  window.addEventListener("hashchange", () => openFromLocation({ scroll: true }));

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Escape") return;
      if (!current) return;
      e.stopPropagation();
      const closed = current;
      select(null);
      toggleOf(closed).focus({ preventScroll: true });
    },
    true
  );

  let resizeQueued = false;
  const ro = new ResizeObserver(() => {
    if (!drawn) return;
    if (resizeQueued) return;
    resizeQueued = true;
    window.requestAnimationFrame(() => {
      resizeQueued = false;
      drawRails();
    });
  });

  function start() {
    openFromLocation({ scroll: true });
    drawRails();
    window.setTimeout(
      () => {
        if (svg) svg.classList.add("is-drawn");
        drawn = true;
        ro.observe(board);
      },
      reduce.matches ? 0 : 950
    );
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();
})();
