(() => {
  const data = window.ROADMAP;
  if (!data) return;

  const stage = document.querySelector("[data-stage]");
  const world = document.querySelector("[data-world]");
  const svg = document.querySelector("[data-edges]");
  const drawer = document.querySelector("[data-drawer]");
  const zoomEl = document.querySelector("[data-zoom]");
  const listBtn = document.querySelector("[data-list-btn]");
  const listPanel = document.querySelector("[data-listpanel]");
  if (!stage || !world || !svg || !drawer) return;

  const byId = new Map(data.nodes.map((n) => [n.id, n]));
  const KIND_LABEL = { skill: "Skill", cert: "Cert", lab: "Lab", project: "Project" };
  const DOT = 24;
  const ZMIN = 0.4;
  const ZMAX = 1.6;
  const clampZ = (v) => Math.min(ZMAX, Math.max(ZMIN, v));
  const SHEET_QUERY = "(max-width: 47.9375rem)";
  const sheetMQ = window.matchMedia(SHEET_QUERY);
  const WORLD_PAD = 48;
  const DRAWER_W = 340;
  const FIT_PAD = 48;
  const NAV_CLEAR = 96;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let hideDrawerOnEnd = null;
  let hideDrawerTimer = 0;

  const params = new URLSearchParams(window.location.search);
  const requested = params.get("node");
  let selected = byId.has(requested) ? requested : null;
  let tx = 0;
  let ty = 0;
  let z = 1;
  let lastFocus = null;
  let resizeQueued = false;

  function syncURL() {
    const q = new URLSearchParams();
    if (selected) q.set("node", selected);
    const next = q.toString();
    window.history.replaceState(null, "", next ? "?" + next : window.location.pathname);
  }

  function applyTransform() {
    world.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + z + ")";
    const pitch = DOT * z;
    stage.style.backgroundSize = pitch + "px " + pitch + "px";
    stage.style.backgroundPosition = tx + "px " + ty + "px";
  }

  const nodeEls = new Map();
  data.nodes.forEach((node, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "rnode";
    b.style.left = node.x + "px";
    b.style.top = node.y + "px";
    b.dataset.node = node.id;
    if (i === 0) b.id = "first-node";
    const kind = document.createElement("small");
    kind.textContent = KIND_LABEL[node.kinds[0]] || node.kinds[0];
    b.appendChild(kind);
    b.appendChild(document.createTextNode(node.title));
    b.setAttribute("aria-expanded", "false");
    b.addEventListener("click", () => openNode(node.id, { pan: true }));
    world.appendChild(b);
    nodeEls.set(node.id, b);
  });

  function sizeWorld() {
    let w = 0;
    let h = 0;
    nodeEls.forEach((el) => {
      w = Math.max(w, el.offsetLeft + el.offsetWidth);
      h = Math.max(h, el.offsetTop + el.offsetHeight);
    });
    w += WORLD_PAD;
    h += WORLD_PAD;
    world.style.width = w + "px";
    world.style.height = h + "px";
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
  }

  function drawEdges() {
    svg.innerHTML = "";
    const ns = "http://www.w3.org/2000/svg";
    data.edges.forEach((e) => {
      const a = nodeEls.get(e.from);
      const b = nodeEls.get(e.to);
      if (!a || !b) return;
      const x1 = a.offsetLeft + a.offsetWidth;
      const y1 = a.offsetTop + a.offsetHeight / 2;
      const x2 = b.offsetLeft;
      const y2 = b.offsetTop + b.offsetHeight / 2;
      const mid = (x1 + x2) / 2;
      const p = document.createElementNS(ns, "path");
      const d =
        y1 === y2
          ? "M" + x1 + " " + y1 + " H" + x2
          : "M" + x1 + " " + y1 + " H" + mid + " V" + y2 + " H" + x2;
      p.setAttribute("d", d);
      p.setAttribute("fill", "none");
      p.setAttribute("stroke-width", "1.25");
      p.style.stroke = "var(--ink)";
      svg.appendChild(p);
    });
  }

  function paintStates() {
    nodeEls.forEach((el, id) => {
      el.classList.toggle("is-sel", selected === id);
      el.setAttribute("aria-expanded", String(selected === id));
    });
  }

  function cancelHideDrawer() {
    if (hideDrawerOnEnd) {
      drawer.removeEventListener("transitionend", hideDrawerOnEnd);
      hideDrawerOnEnd = null;
    }
    if (hideDrawerTimer) {
      window.clearTimeout(hideDrawerTimer);
      hideDrawerTimer = 0;
    }
  }

  function showDrawer(instant) {
    const alreadyOpen = !drawer.hidden && drawer.classList.contains("is-open");
    cancelHideDrawer();
    drawer.hidden = false;
    if (instant || reduceMotion.matches || alreadyOpen) {
      drawer.classList.add("is-open");
      return;
    }
    drawer.classList.remove("is-open");
    void drawer.offsetWidth;
    drawer.classList.add("is-open");
  }

  function hideDrawer(instant) {
    cancelHideDrawer();
    if (instant || reduceMotion.matches || drawer.hidden) {
      drawer.classList.remove("is-open");
      drawer.hidden = true;
      return;
    }
    if (!drawer.classList.contains("is-open")) {
      drawer.hidden = true;
      return;
    }
    drawer.classList.remove("is-open");
    hideDrawerOnEnd = (e) => {
      if (e.target !== drawer) return;
      if (e.propertyName !== "transform") return;
      cancelHideDrawer();
      if (!drawer.classList.contains("is-open")) drawer.hidden = true;
    };
    drawer.addEventListener("transitionend", hideDrawerOnEnd);
    hideDrawerTimer = window.setTimeout(() => {
      hideDrawerOnEnd({ target: drawer, propertyName: "transform" });
    }, 280);
  }

  function syncDrawerRole() {
    if (drawer.hidden) return;
    if (sheetMQ.matches) {
      drawer.setAttribute("role", "dialog");
      drawer.setAttribute("aria-modal", "true");
    } else {
      drawer.removeAttribute("role");
      drawer.removeAttribute("aria-modal");
    }
  }

  function openNode(id, opts) {
    const node = byId.get(id);
    if (!node) return;
    lastFocus = document.activeElement;
    selected = id;
    paintStates();
    renderDrawer(node);
    showDrawer(opts && opts.instant);
    syncDrawerRole();
    syncURL();
    if (opts && opts.pan) nudgeIntoView(node);
    const head = drawer.querySelector("[data-drawer-title]");
    if (head) head.focus();
  }

  function closeDrawer(restore) {
    if (drawer.hidden && !drawer.classList.contains("is-open")) return false;
    selected = null;
    hideDrawer(false);
    paintStates();
    syncURL();
    if (restore !== false && lastFocus && document.contains(lastFocus)) {
      lastFocus.focus();
    }
    return true;
  }

  function renderDrawer(node) {
    drawer.innerHTML = "";

    const h = document.createElement("h2");
    h.textContent = node.title;
    h.tabIndex = -1;
    h.dataset.drawerTitle = "";
    drawer.appendChild(h);

    const b = document.createElement("p");
    b.textContent = node.briefing;
    drawer.appendChild(b);

    const why = document.createElement("p");
    why.textContent = node.why;
    drawer.appendChild(why);

    if (node.next && node.next.length) {
      const group = document.createElement("div");
      group.className = "drawer__next";
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", "Next nodes");
      node.next.forEach((nid) => {
        const target = byId.get(nid);
        if (!target) return;
        const nb = document.createElement("button");
        nb.type = "button";
        nb.textContent = target.title;
        nb.addEventListener("click", () => openNode(nid, { pan: true }));
        group.appendChild(nb);
      });
      drawer.appendChild(group);
    }

    if (node.links && node.links.length) {
      const links = document.createElement("div");
      links.className = "drawer__links";
      node.links.forEach((l) => {
        const a = document.createElement("a");
        a.href = l.href;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = l.label;
        links.appendChild(a);
      });
      drawer.appendChild(links);
    }

    const close = document.createElement("button");
    close.type = "button";
    close.className = "drawer__close";
    close.textContent = "Close";
    close.addEventListener("click", () => closeDrawer(true));
    drawer.appendChild(close);
  }

  function nudgeIntoView(node) {
    const el = nodeEls.get(node.id);
    if (!el) return;
    const rect = stage.getBoundingClientRect();
    const sx = (el.offsetLeft + el.offsetWidth / 2) * z + tx;
    const sy = (el.offsetTop + el.offsetHeight / 2) * z + ty;
    const drawerW = sheetMQ.matches ? 0 : DRAWER_W;
    const freeW = rect.width - drawerW;
    const wantX = Math.min(Math.max(freeW / 2, 120), Math.max(120, freeW - 120));
    const wantY = Math.min(Math.max(rect.height / 2, 80), Math.max(80, rect.height - 80));
    if (sx > freeW - 40 || sx < 0) {
      tx = wantX - (el.offsetLeft + el.offsetWidth / 2) * z;
    }
    if (sy < 0 || sy > rect.height) {
      ty = wantY - (el.offsetTop + el.offsetHeight / 2) * z;
    }
    applyTransform();
  }

  const pointers = new Map();
  let panStart = null;
  let pinchStart = null;

  stage.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".rnode, .drawer, .zoom, .listpanel")) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      panStart = { x: e.clientX, y: e.clientY, tx, ty };
      stage.classList.add("is-panning");
    } else if (pointers.size === 2) {
      const pts = [...pointers.values()];
      pinchStart = {
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        z,
        tx,
        ty
      };
      panStart = null;
    }
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinchStart) {
      const pts = [...pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (dist > 0) {
        const rect = stage.getBoundingClientRect();
        const cx = (pts[0].x + pts[1].x) / 2 - rect.left;
        const cy = (pts[0].y + pts[1].y) / 2 - rect.top;
        const nz = clampZ(pinchStart.z * (dist / pinchStart.dist));
        zoomAt(cx, cy, nz, pinchStart.tx, pinchStart.ty, pinchStart.z);
      }
      return;
    }
    if (panStart) {
      tx = panStart.tx + (e.clientX - panStart.x);
      ty = panStart.ty + (e.clientY - panStart.y);
      applyTransform();
    }
  });

  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStart = null;
    if (pointers.size === 0) {
      panStart = null;
      stage.classList.remove("is-panning");
    } else if (pointers.size === 1) {
      const pt = [...pointers.values()][0];
      panStart = { x: pt.x, y: pt.y, tx, ty };
    }
  }
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);

  function zoomAt(cx, cy, nz, fromTx, fromTy, fromZ) {
    const wx = (cx - fromTx) / fromZ;
    const wy = (cy - fromTy) / fromZ;
    z = clampZ(nz);
    tx = cx - wx * z;
    ty = cy - wy * z;
    applyTransform();
  }

  stage.addEventListener(
    "wheel",
    (e) => {
      if (e.target.closest(".drawer, .listpanel, .zoom")) return;
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      zoomAt(cx, cy, z * (e.deltaY < 0 ? 1.1 : 0.9), tx, ty, z);
    },
    { passive: false }
  );

  function zoomStep(dir) {
    const rect = stage.getBoundingClientRect();
    zoomAt(rect.width / 2, rect.height / 2, z * (dir > 0 ? 1.2 : 1 / 1.2), tx, ty, z);
  }

  function fitAll() {
    const rect = stage.getBoundingClientRect();
    const w = world.offsetWidth;
    const h = world.offsetHeight;
    if (!w || !h) return;
    z = clampZ(Math.min((rect.width - FIT_PAD) / w, (rect.height - FIT_PAD) / h, 1));
    tx = (rect.width - w * z) / 2;
    ty = (rect.height - h * z) / 2;
    applyTransform();
  }

  if (zoomEl) {
    zoomEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.dataset.zoom === "in") zoomStep(1);
      else if (btn.dataset.zoom === "out") zoomStep(-1);
      else if (btn.dataset.zoom === "fit") fitAll();
    });
  }

  if (listBtn && listPanel) {
    const ol = document.createElement("ol");
    data.nodes.forEach((node) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = node.title;
      b.addEventListener("click", () => openNode(node.id, { pan: true }));
      li.appendChild(b);
      ol.appendChild(li);
    });
    listPanel.appendChild(ol);
    listBtn.addEventListener("click", () => {
      const open = listPanel.hidden;
      listPanel.hidden = !open;
      listBtn.setAttribute("aria-expanded", String(open));
    });
  }

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Escape") return;
      if (!drawer.hidden) {
        e.stopPropagation();
        closeDrawer(true);
      } else if (listPanel && !listPanel.hidden) {
        e.stopPropagation();
        listPanel.hidden = true;
        if (listBtn) {
          listBtn.setAttribute("aria-expanded", "false");
          listBtn.focus();
        }
      }
    },
    true
  );

  function initialView() {
    const rect = stage.getBoundingClientRect();
    const enter = byId.get("enter");
    z = clampZ(Math.min(1.1, Math.max(0.55, rect.width / 1100)));
    tx = 24;
    if (enter) {
      ty = NAV_CLEAR + (rect.height - NAV_CLEAR) / 2 - (enter.y + 30) * z;
    }
    applyTransform();
  }

  sizeWorld();
  drawEdges();
  paintStates();
  syncURL();
  initialView();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      sizeWorld();
      drawEdges();
    });
  }
  window.addEventListener("resize", () => {
    if (resizeQueued) return;
    resizeQueued = true;
    window.requestAnimationFrame(() => {
      resizeQueued = false;
      drawEdges();
    });
  });
  sheetMQ.addEventListener("change", syncDrawerRole);

  if (selected) {
    openNode(selected, { pan: true, instant: true });
  }
})();
