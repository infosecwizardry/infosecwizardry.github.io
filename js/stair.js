(() => {
  const stair = document.querySelector("[data-stair]");
  if (!stair) return;

  const steps = [...stair.querySelectorAll("[data-stair-step]")];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
  const DROP = 880;
  const STAGGER = 560;
  const HOLD = 3400;
  const DISSOLVE = 400;
  const REST = 480;
  const OFF = "translate3d(0, -18rem, 2.5rem)";
  const ON = "translate3d(0, 0, 0)";
  const LIFT = "translate3d(0, -1.25rem, 0.5rem)";

  let generation = 0;
  let playing = false;
  let visible = false;
  let boot = 0;
  let waiters = [];

  const reduced = () => motion.matches;
  const hidden = () => document.visibilityState === "hidden";
  const canPlay = () => !reduced() && visible && !hidden();
  const live = (gen) => playing && gen === generation;

  const rectOf = (step) => step.querySelector(".stair__rect");
  const massOf = (step) => step.querySelector(".stair__mass");
  const facesOf = (step) => [...step.querySelectorAll(".stair__face")];

  const keepRim = (anim) => {
    const name = anim.animationName;
    return name === "rim-outline" || name === "stair-rim-outline";
  };

  const killAnims = (el) => {
    el.getAnimations().forEach((anim) => {
      if (keepRim(anim)) return;
      try {
        anim.cancel();
      } catch {
        /* ignore */
      }
    });
  };

  const nuke = () => {
    const list =
      typeof stair.getAnimations === "function"
        ? stair.getAnimations({ subtree: true })
        : [];
    list.forEach((anim) => {
      if (keepRim(anim)) return;
      try {
        anim.cancel();
      } catch {
        /* ignore */
      }
    });
  };

  const seal = (anim, el, styles) => {
    try {
      anim.commitStyles();
    } catch {
      /* ignore */
    }
    try {
      anim.cancel();
    } catch {
      /* ignore */
    }
    Object.assign(el.style, styles);
  };

  const finishWaiters = () => {
    const pending = waiters;
    waiters = [];
    pending.forEach(({ timer, resolve }) => {
      window.clearTimeout(timer);
      resolve(false);
    });
  };

  const wait = (ms, gen) =>
    new Promise((resolve) => {
      if (!live(gen)) {
        resolve(false);
        return;
      }
      const entry = { resolve, timer: 0 };
      entry.timer = window.setTimeout(() => {
        waiters = waiters.filter((item) => item !== entry);
        resolve(live(gen));
      }, ms);
      waiters.push(entry);
    });

  const setFaces = (step, opacity) => {
    facesOf(step).forEach((face) => {
      killAnims(face);
      face.style.opacity = String(opacity);
    });
  };

  const fadeFaces = (step, to, ms, gen) => {
    const jobs = facesOf(step).map((face) => {
      const from = Number.parseFloat(getComputedStyle(face).opacity);
      killAnims(face);
      return [
        face,
        face.animate([{ opacity: Number.isFinite(from) ? from : 1 - to }, { opacity: to }], {
          duration: ms,
          easing: ease,
          fill: "forwards",
        }),
      ];
    });
    wait(ms, gen).then((ok) => {
      jobs.forEach(([face, anim]) => {
        seal(anim, face, { opacity: String(ok ? to : face.style.opacity || "0") });
      });
    });
  };

  const applyPose = (assembled) => {
    steps.forEach((step) => {
      const rect = rectOf(step);
      const mass = massOf(step);
      rect.style.transform = assembled ? ON : OFF;
      mass.style.transform = "none";
      setFaces(step, assembled ? 1 : 0);
    });
  };

  const reset = (assembled) => {
    finishWaiters();
    nuke();
    applyPose(assembled);
    void stair.offsetHeight;
    nuke();
    applyPose(assembled);
  };

  const settle = (index, gen) => {
    if (!live(gen)) return;

    const landing = massOf(steps[index]);
    killAnims(landing);
    landing.animate(
      [
        { transform: "none" },
        { transform: "scale3d(1.01, 0.96, 1)", offset: 0.3 },
        { transform: "none" },
      ],
      { duration: 300, easing: ease }
    );

    if (index === 0) return;

    const underRect = rectOf(steps[index - 1]);
    if (underRect.getAnimations().some((anim) => anim.playState === "running")) return;

    const under = massOf(steps[index - 1]);
    killAnims(under);
    under.animate(
      [
        { transform: "none" },
        { transform: "translate3d(0, 2px, 0)", offset: 0.35 },
        { transform: "none" },
      ],
      { duration: 240, easing: ease }
    );
  };

  const drop = (index, gen) => {
    if (!live(gen)) return;
    const step = steps[index];
    const rect = rectOf(step);
    killAnims(rect);
    rect.style.transform = OFF;
    fadeFaces(step, 1, 320, gen);
    const anim = rect.animate([{ transform: OFF }, { transform: ON }], {
      duration: DROP,
      easing: ease,
      fill: "forwards",
    });
    wait(DROP, gen).then((ok) => {
      if (!ok) return;
      seal(anim, rect, { transform: ON });
      settle(index, gen);
    });
  };

  const dissolve = async (gen) => {
    for (let i = steps.length - 1; i >= 0; i -= 1) {
      if (!live(gen)) return false;
      const rect = rectOf(steps[i]);
      fadeFaces(steps[i], 0, DISSOLVE, gen);
      rect.style.transform = ON;
      killAnims(rect);
      const anim = rect.animate([{ transform: ON }, { transform: LIFT }], {
        duration: DISSOLVE,
        easing: ease,
        fill: "forwards",
      });
      wait(DISSOLVE, gen).then((ok) => {
        if (!ok) return;
        seal(anim, rect, { transform: LIFT, opacity: "" });
      });
      if (!(await wait(90, gen))) return false;
    }
    return wait(DISSOLVE, gen);
  };

  const run = async (gen) => {
    const last = steps.length - 1;
    while (live(gen)) {
      reset(false);
      for (let i = 0; i < last; i += 1) {
        if (!live(gen)) return;
        drop(i, gen);
        if (!(await wait(STAGGER, gen))) return;
      }
      if (!live(gen)) return;
      drop(last, gen);
      if (!(await wait(DROP, gen))) return;
      if (!(await wait(HOLD, gen))) return;
      if (!(await dissolve(gen))) return;
      if (!(await wait(REST, gen))) return;
    }
  };

  const stop = () => {
    playing = false;
    generation += 1;
    reset(false);
  };

  const playAfterPaint = () => {
    const id = ++boot;
    reset(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (id !== boot || !canPlay() || playing) return;
        reset(false);
        playing = true;
        generation += 1;
        run(generation);
      });
    });
  };

  const sync = () => {
    if (reduced()) {
      boot += 1;
      playing = false;
      generation += 1;
      reset(true);
      stair.classList.add("is-built");
      stair.classList.remove("is-pending");
      return;
    }
    if (!canPlay()) {
      boot += 1;
      stop();
      return;
    }
    if (playing) return;
    playAfterPaint();
  };

  document.addEventListener("visibilitychange", sync);
  window.addEventListener("pageshow", sync);
  window.addEventListener("pagehide", () => {
    boot += 1;
    stop();
  });
  motion.addEventListener("change", sync);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      stair.classList.toggle("is-built", visible);
      stair.classList.toggle("is-pending", !visible);
      sync();
    },
    { threshold: 0.18 }
  );
  io.observe(stair);
})();
