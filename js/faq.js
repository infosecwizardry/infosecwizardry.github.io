(() => {
  const items = [...document.querySelectorAll(".faq-item")];
  if (!items.length) return;

  const collapsePanel = (panel) => {
    if (!panel) return;
    const h = panel.getBoundingClientRect().height;
    if (h > 0) {
      panel.style.height = `${Math.round(h)}px`;
      void panel.offsetHeight;
    }
    panel.style.height = "0px";
  };

  const expandPanel = (panel, inner) => {
    if (!panel || !inner) return;
    panel.style.height = `${inner.scrollHeight}px`;
  };

  const closeItem = (item) => {
    const button = item.querySelector(".faq-item__q");
    const panel = item.querySelector(".faq-item__panel");
    const inner = item.querySelector(".faq-item__panel-inner");
    item.classList.remove("is-open");
    if (panel) panel.classList.remove("is-open");
    if (inner) inner.classList.remove("is-open");
    collapsePanel(panel);
    if (button) button.setAttribute("aria-expanded", "false");
  };

  const openItem = (item) => {
    const button = item.querySelector(".faq-item__q");
    const panel = item.querySelector(".faq-item__panel");
    const inner = item.querySelector(".faq-item__panel-inner");
    item.classList.add("is-open");
    if (panel) panel.classList.add("is-open");
    if (inner) inner.classList.add("is-open");
    expandPanel(panel, inner);
    if (button) button.setAttribute("aria-expanded", "true");
  };

  items.forEach((item) => {
    const button = item.querySelector(".faq-item__q");
    if (!button) return;
    button.addEventListener("click", (event) => {
      const open = item.classList.contains("is-open");
      items.forEach(closeItem);
      if (!open) openItem(item);
      if (event.detail > 0) button.blur();
    });
  });
})();
