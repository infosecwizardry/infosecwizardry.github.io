(() => {
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const chips = document.querySelectorAll("#chips .chip");
  const cards = document.querySelectorAll("#portfolio-grid .portfolio-card");
  if (chips.length && cards.length) {
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => {
          c.classList.remove("is-active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        const track = chip.dataset.track;
        cards.forEach((card) => {
          const show = track === "all" || card.dataset.track === track;
          const wasHidden = card.hidden;
          card.classList.remove("is-entering");
          card.hidden = !show;
          if (show && wasHidden && !reducedMotion()) {
            void card.offsetWidth;
            card.classList.add("is-entering");
          }
        });
      });
    });
  }

  const preview = document.getElementById("portfolio-preview");
  if (!preview) return;
  const frame = document.getElementById("portfolio-preview-frame");
  const title = document.getElementById("portfolio-preview-title");
  const openLink = document.getElementById("portfolio-preview-open");
  const closeBtn = preview.querySelector("[data-preview-close].portfolio-preview__close");
  const root = document.documentElement;
  const header = document.querySelector("[data-nav]");
  let opener = null;
  let closeTimer = 0;
  let scrollY = 0;

  const pagePeers = () =>
    [...document.body.children].filter((el) => el !== preview);

  const closeNavDrawer = () => {
    const trigger = document.querySelector("[data-nav-trigger]");
    const drawer = document.querySelector("[data-nav-drawer]");
    if (!drawer || !drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-label", "Open menu");
    }
    document.body.classList.remove("nav-open");
  };

  const readScrollY = () =>
    window.scrollY || document.documentElement.scrollTop || 0;

  const writeScrollY = (y) => {
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
    window.scrollTo(0, y);
  };

  const lockPage = () => {
    scrollY = readScrollY();
    closeNavDrawer();
    root.classList.add("is-preview-open");
    pagePeers().forEach((el) => {
      el.setAttribute("inert", "");
    });
    if (header) header.style.setProperty("margin-top", "-8rem", "important");
    writeScrollY(scrollY);
  };

  const unlockPage = () => {
    root.classList.remove("is-preview-open", "is-preview-closing");
    if (header) header.style.removeProperty("margin-top");
    pagePeers().forEach((el) => {
      el.removeAttribute("inert");
    });
    writeScrollY(scrollY);
  };

  const blockBehindScroll = (event) => {
    if (preview.hidden) return;
    if (event.target === frame) return;
    event.preventDefault();
  };

  const open = (url, name, trigger) => {
    window.clearTimeout(closeTimer);
    preview.classList.remove("is-closing");
    root.classList.remove("is-preview-closing");
    opener = trigger || null;
    if (title) title.textContent = name || "Member portfolio";
    if (openLink) openLink.href = url;
    if (frame) frame.src = url;
    preview.hidden = false;
    lockPage();
    if (closeBtn) closeBtn.focus({ preventScroll: true });
    writeScrollY(scrollY);
  };

  const finishClose = () => {
    const y = scrollY;
    preview.hidden = true;
    preview.classList.remove("is-closing");
    if (frame) frame.removeAttribute("src");
    unlockPage();
    if (opener && typeof opener.focus === "function") {
      opener.focus({ preventScroll: true });
    }
    opener = null;
    writeScrollY(y);
    window.requestAnimationFrame(() => writeScrollY(y));
  };

  const close = () => {
    if (preview.hidden) return;
    if (reducedMotion()) {
      finishClose();
      return;
    }
    preview.classList.add("is-closing");
    root.classList.add("is-preview-closing");
    if (header) header.style.setProperty("margin-top", "0px", "important");
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(finishClose, 420);
  };

  document.querySelectorAll("[data-preview-url]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      open(trigger.dataset.previewUrl, trigger.dataset.previewName, trigger);
    });
  });

  preview.querySelectorAll("[data-preview-close]").forEach((el) => {
    el.addEventListener("click", close);
  });

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && !preview.hidden) {
        event.stopImmediatePropagation();
        close();
      }
    },
    true
  );

  window.addEventListener("wheel", blockBehindScroll, { passive: false });
  window.addEventListener("touchmove", blockBehindScroll, { passive: false });
})();
