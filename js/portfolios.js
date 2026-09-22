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
  let opener = null;
  let closeTimer = 0;

  const open = (url, name, trigger) => {
    window.clearTimeout(closeTimer);
    preview.classList.remove("is-closing");
    opener = trigger || null;
    if (title) title.textContent = name || "Member portfolio";
    if (openLink) openLink.href = url;
    if (frame) frame.src = url;
    preview.hidden = false;
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  };

  const finishClose = () => {
    preview.hidden = true;
    preview.classList.remove("is-closing");
    if (frame) frame.removeAttribute("src");
    document.body.style.overflow = "";
    if (opener && typeof opener.focus === "function") opener.focus();
    opener = null;
  };

  const close = () => {
    if (preview.hidden) return;
    if (reducedMotion()) {
      finishClose();
      return;
    }
    preview.classList.add("is-closing");
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(finishClose, 200);
  };

  document.querySelectorAll("[data-preview-url]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      open(trigger.dataset.previewUrl, trigger.dataset.previewName, trigger);
    });
  });

  preview.querySelectorAll("[data-preview-close]").forEach((el) => {
    el.addEventListener("click", close);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !preview.hidden) close();
  });
})();
