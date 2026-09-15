(() => {
  const chips = document.querySelectorAll("#chips .chip");
  const cards = document.querySelectorAll("#portfolio-grid .portfolio-card");
  if (!chips.length || !cards.length) return;

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
        card.hidden = track !== "all" && card.dataset.track !== track;
      });
    });
  });
})();
