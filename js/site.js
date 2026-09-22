(() => {
  const header = document.querySelector("[data-nav]");
  const trigger = document.querySelector("[data-nav-trigger]");
  const drawer = document.querySelector("[data-nav-drawer]");
  if (!header) return;

  if (trigger && drawer) {
    const close = () => {
      drawer.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("nav-open");
    };

    trigger.addEventListener("click", () => {
      const open = !drawer.classList.contains("is-open");
      drawer.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      trigger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("nav-open", open);
    });

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();

/* Reusable page-switch transition. Cascades elements carrying
   class="page-fade" in on load and fades them up fast on internal
   page switches. Skipped without JS (content stays visible) and under
   prefers-reduced-motion (instant navigation). */
(() => {
  const DURATION = 150;
  const root = document.documentElement;
  if (!document.querySelector(".page-fade")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  root.classList.add("is-entering");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.remove("is-entering"));
  });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) root.classList.remove("is-entering", "is-leaving");
  });

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a");
    if (!link) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    let url;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return;
    if (root.classList.contains("is-leaving")) return;
    event.preventDefault();
    root.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = url.toString();
    }, DURATION);
  });
})();

/* Scroll reveals: one IntersectionObserver over section heads and cards.
   Hidden state lives in css/site.css under prefers-reduced-motion:
   no-preference and html.js-reveal, so content stays visible without JS,
   without IO support, or under reduced motion (early return below).
   First-viewport targets skip the load animation (page-fade owns that).
   They replay when they leave the viewport and come back.
   Hero copy and .stair are never targets. No RAF loop. */
(() => {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const targets = document.querySelectorAll(
    ".audience__head, .lanes .lane, .operators__head, .operator, .voices__head, .coming h2, .coming-item"
  );
  if (!targets.length) return;
  document.documentElement.classList.add("js-reveal");
  const show = (el) => el.classList.add("is-revealed");
  const settle = (el) => {
    if (el.classList.contains("is-revealed")) el.classList.add("is-settled");
  };
  const hide = (el) => el.classList.remove("is-revealed", "is-settled");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.15) {
          show(entry.target);
          entry.target.addEventListener("transitionend", () => settle(entry.target), { once: true });
        } else if (entry.intersectionRatio === 0) {
          hide(entry.target);
        }
      });
    },
    { threshold: [0, 0.15] }
  );
  const fold = window.innerHeight * 0.92;
  targets.forEach((el) => {
    el.classList.add("reveal");
    const rect = el.getBoundingClientRect();
    if (rect.top < fold && rect.bottom > 0) {
      show(el);
      settle(el);
    }
    observer.observe(el);
  });
})();

/* Desktop nav thumb: a paper capsule that sits on the current page
   and slides to the hovered or focused link. Does not touch drawer
   open/close, aria-expanded, or focus trapping. */
(() => {
  const linksWrap = document.querySelector(".nav__links");
  if (!linksWrap) return;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 992px)");
  const items = () => [...linksWrap.querySelectorAll(":scope > a")];
  const current = () => linksWrap.querySelector(":scope > a[aria-current='page']");

  let thumb = null;
  let attached = false;

  function place(el, instant) {
    items().forEach((a) => a.classList.toggle("is-hot", a === el));
    if (!thumb) return;
    if (instant) thumb.classList.remove("is-ready");
    if (!el) {
      thumb.style.width = "0px";
    } else {
      thumb.style.width = el.offsetWidth + "px";
      thumb.style.transform = "translateX(" + el.offsetLeft + "px)";
    }
    if (instant) {
      void thumb.offsetWidth;
      thumb.classList.add("is-ready");
    }
  }

  function onEnter(event) {
    place(event.currentTarget);
  }

  function onLeave() {
    if (document.documentElement.classList.contains("is-leaving")) return;
    place(current());
  }

  function onClick(event) {
    place(event.currentTarget, true);
  }

  function unbind() {
    if (!attached) return;
    items().forEach((a) => {
      a.removeEventListener("pointerenter", onEnter);
      a.removeEventListener("focus", onEnter);
      a.removeEventListener("click", onClick);
    });
    linksWrap.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("resize", onResize);
    items().forEach((a) => a.classList.remove("is-hot"));
    if (thumb) {
      thumb.remove();
      thumb = null;
    }
    attached = false;
  }

  function onResize() {
    place(current(), true);
  }

  function bind() {
    if (motion.matches || !desktop.matches) {
      unbind();
      return;
    }
    if (!thumb) {
      thumb = document.createElement("span");
      thumb.className = "nav__thumb";
      thumb.setAttribute("aria-hidden", "true");
      linksWrap.prepend(thumb);
    }
    if (!attached) {
      items().forEach((a) => {
        a.addEventListener("pointerenter", onEnter);
        a.addEventListener("focus", onEnter);
        a.addEventListener("click", onClick);
      });
      linksWrap.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", onResize);
      attached = true;
    }
    place(current(), true);
  }

  bind();
  motion.addEventListener("change", bind);
  desktop.addEventListener("change", bind);
  window.addEventListener("pageshow", () => {
    if (attached) place(current(), true);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (attached) place(current(), true);
    });
  }
})();

/* Footer year: keeps the copyright line current without an inline script.
   Guarded because site.js also loads on pages without a #y node. */
(() => {
  const year = document.getElementById("y");
  if (year) year.textContent = String(new Date().getFullYear());
})();
