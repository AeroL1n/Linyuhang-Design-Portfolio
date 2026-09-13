const body = document.body;
const header = document.querySelector("[data-project-header]");
const menuButton = document.querySelector("[data-project-menu]");
const projectNav = document.querySelector(".project-nav");
const frames = [...document.querySelectorAll("[data-frame]")];
const titleReveals = [...document.querySelectorAll(".title-reveal")];
const outroReveals = [...document.querySelectorAll("[data-outro-reveal]")];
const contactControl = document.querySelector(".contact-control");
const contactToggle = document.querySelector("[data-contact-toggle]");
const contactPopover = document.querySelector(".contact-popover");
const sayHelloControl = document.querySelector(".say-hello-contact-control");
const sayHelloToggle = document.querySelector("[data-say-hello-contact-toggle]");
const sayHelloPopover = document.querySelector("#say-hello-contact-popover");
const copyButtons = [...document.querySelectorAll("[data-copy-wechat]")];
const desktopPointer = window.matchMedia("(min-width: 801px) and (hover: hover) and (pointer: fine)");

function closeMenu() {
  body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
}

menuButton?.addEventListener("click", () => {
  const nextOpen = !body.classList.contains("menu-open");
  body.classList.toggle("menu-open", nextOpen);
  menuButton.setAttribute("aria-expanded", String(nextOpen));
  header?.classList.remove("is-hidden");
});

projectNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

function closeContact() {
  [
    [contactPopover, contactToggle],
    [sayHelloPopover, sayHelloToggle],
  ].forEach(([popover, toggle]) => {
    popover?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  });
}

contactToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  const nextOpen = !contactPopover?.classList.contains("is-open");
  contactPopover?.classList.toggle("is-open", nextOpen);
  contactToggle.setAttribute("aria-expanded", String(nextOpen));
});

sayHelloToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  const nextOpen = !sayHelloPopover?.classList.contains("is-open");
  closeContact();
  sayHelloPopover?.classList.toggle("is-open", nextOpen);
  sayHelloToggle.setAttribute("aria-expanded", String(nextOpen));
});

sayHelloControl?.addEventListener("pointerenter", () => {
  if (!desktopPointer.matches) return;
  sayHelloPopover?.classList.add("is-open");
  sayHelloToggle?.setAttribute("aria-expanded", "true");
});

contactControl?.addEventListener("pointerenter", () => {
  if (!desktopPointer.matches) return;
  contactPopover?.classList.add("is-open");
  contactToggle?.setAttribute("aria-expanded", "true");
});

sayHelloControl?.addEventListener("pointerleave", () => {
  if (desktopPointer.matches) closeContact();
});

window.addEventListener("pointermove", (event) => {
  if (!desktopPointer.matches || !contactPopover?.classList.contains("is-open") || !contactControl) return;

  const controlBounds = contactControl.getBoundingClientRect();
  const popoverBounds = contactPopover.getBoundingClientRect();
  const inside = event.clientX >= Math.min(controlBounds.left, popoverBounds.left)
    && event.clientX <= Math.max(controlBounds.right, popoverBounds.right)
    && event.clientY >= Math.min(controlBounds.top, popoverBounds.top)
    && event.clientY <= Math.max(controlBounds.bottom, popoverBounds.bottom);

  if (!inside) closeContact();
}, { passive: true });

window.addEventListener("pointermove", (event) => {
  if (!desktopPointer.matches || !sayHelloPopover?.classList.contains("is-open") || !sayHelloControl) return;

  const controlBounds = sayHelloControl.getBoundingClientRect();
  const popoverBounds = sayHelloPopover.getBoundingClientRect();
  const inside = event.clientX >= Math.min(controlBounds.left, popoverBounds.left)
    && event.clientX <= Math.max(controlBounds.right, popoverBounds.right)
    && event.clientY >= Math.min(controlBounds.top, popoverBounds.top)
    && event.clientY <= Math.max(controlBounds.bottom, popoverBounds.bottom);

  if (!inside) closeContact();
}, { passive: true });

document.addEventListener("click", (event) => {
  if (!event.target.closest(".contact-control, .say-hello-contact-control")) closeContact();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeContact();
  closeMenu();
});

copyButtons.forEach((button) => button.addEventListener("click", async (event) => {
  event.stopPropagation();
  try {
    await navigator.clipboard.writeText("Hangz-zai");
  } catch {
    const input = document.createElement("textarea");
    input.value = "Hangz-zai";
    input.setAttribute("readonly", "true");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }

  button.classList.add("is-copied");
  button.setAttribute("aria-label", "微信号已复制");
  window.setTimeout(() => {
    button.classList.remove("is-copied");
    button.setAttribute("aria-label", "复制微信号");
  }, 1400);
}));

function setupHeader() {
  if (!header) return;
  let lastY = Math.max(0, window.scrollY);
  let direction = 0;
  let travel = 0;
  let frame = 0;

  function update() {
    const currentY = Math.max(0, window.scrollY);
    const delta = currentY - lastY;
    const nextDirection = delta > 0 ? 1 : delta < 0 ? -1 : direction;

    if (nextDirection !== direction) {
      direction = nextDirection;
      travel = 0;
    }
    travel += Math.abs(delta);

    const atTop = currentY <= 80;
    header.classList.toggle("is-scrolled", !atTop);

    if (atTop || body.classList.contains("menu-open")) {
      header.classList.remove("is-hidden");
    } else if (direction > 0 && currentY > 160 && travel >= 36) {
      header.classList.add("is-hidden");
      closeContact();
      travel = 0;
    } else if (direction < 0 && travel >= 14) {
      header.classList.remove("is-hidden");
      travel = 0;
    }

    lastY = currentY;
    frame = 0;
  }

  window.addEventListener("scroll", () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  }, { passive: true });
  update();
}

setupHeader();

const frameObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { rootMargin: "10% 0px 12%", threshold: 0.06 });

frames.forEach((frame) => frameObserver.observe(frame));
outroReveals.forEach((element) => frameObserver.observe(element));

const titleObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting || entry.intersectionRatio < 0.25) return;
    entry.target.classList.add("is-title-visible");
    observer.unobserve(entry.target);
  });
}, { rootMargin: "0px 0px -10% 0px", threshold: [0.25] });

titleReveals.forEach((title) => titleObserver.observe(title));

function revealInitialViewport() {
  frames.forEach((frame) => {
    const bounds = frame.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 1.08 && bounds.bottom > -40) frame.classList.add("is-visible");
  });
}

revealInitialViewport();
frames.forEach((frame) => {
  frame.querySelector("img")?.addEventListener("load", revealInitialViewport, { once: true });
});
window.addEventListener("scroll", revealInitialViewport, { passive: true });
window.addEventListener("hashchange", revealInitialViewport);
window.addEventListener("load", () => {
  revealInitialViewport();
  window.requestAnimationFrame(revealInitialViewport);
  window.setTimeout(revealInitialViewport, 240);
}, { once: true });

function setupViewportVideo() {
  const video = document.querySelector("[data-viewport-video]");
  const frame = video?.closest("[data-frame]");
  if (!video || !frame) return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let sufficientlyVisible = false;

  function updatePlayback() {
    if (sufficientlyVisible && !document.hidden && !reduceMotionQuery.matches) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  const observer = new IntersectionObserver(([entry]) => {
    sufficientlyVisible = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.35);
    updatePlayback();

    if (entry && !entry.isIntersecting) {
      video.currentTime = 0;
    }
  }, { threshold: [0, 0.35] });

  observer.observe(frame);
  document.addEventListener("visibilitychange", updatePlayback);
  reduceMotionQuery.addEventListener("change", updatePlayback);
}

setupViewportVideo();

function setupSayHelloScrollReveal() {
  const card = document.querySelector(".say-hello-card");
  const content = card?.querySelector(".say-hello-content");
  const subtitle = content?.querySelector(":scope > p");
  const action = content?.querySelector(".say-hello-contact-control");
  if (!card || !content || !subtitle || !action) return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLayout = window.matchMedia("(max-width: 800px)");
  let targetProgress = 0;
  let currentProgress = 0;
  let frameId = 0;
  let initialized = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function smoothstep(value) {
    const amount = clamp(value, 0, 1);
    return amount * amount * (3 - 2 * amount);
  }

  function measureProgress() {
    if (reduceMotionQuery.matches) return 1;

    const cardTop = card.getBoundingClientRect().top + window.scrollY;
    const viewport = window.innerHeight;
    const start = cardTop - viewport * (mobileLayout.matches ? 0.9 : 0.92);
    const travel = viewport * (mobileLayout.matches ? 0.72 : 0.62);
    return clamp((window.scrollY - start) / travel, 0, 1);
  }

  function render() {
    currentProgress += (targetProgress - currentProgress) * 0.2;
    if (Math.abs(targetProgress - currentProgress) < 0.001) currentProgress = targetProgress;

    const subtitleProgress = smoothstep(currentProgress / 0.48);
    const actionProgress = smoothstep((currentProgress - 0.14) / 0.62);
    const subtitleLift = mobileLayout.matches ? 10 : 14;
    const actionLift = mobileLayout.matches ? 14 : 18;

    subtitle.style.opacity = subtitleProgress.toFixed(4);
    subtitle.style.transform = `translateY(${((1 - subtitleProgress) * subtitleLift).toFixed(2)}px)`;
    action.style.opacity = actionProgress.toFixed(4);
    action.style.transform = `translateY(${((1 - actionProgress) * actionLift).toFixed(2)}px) scale(${(0.96 + actionProgress * 0.04).toFixed(4)})`;

    frameId = currentProgress !== targetProgress ? window.requestAnimationFrame(render) : 0;
  }

  function update({ immediate = false } = {}) {
    targetProgress = measureProgress();

    if (immediate || !initialized) {
      initialized = true;
      currentProgress = targetProgress;
      render();
      return;
    }

    if (!frameId) frameId = window.requestAnimationFrame(render);
  }

  content.classList.add("is-scroll-progress");
  update({ immediate: true });
  window.addEventListener("scroll", () => update(), { passive: true });
  window.addEventListener("resize", () => update({ immediate: true }), { passive: true });
  reduceMotionQuery.addEventListener("change", () => update({ immediate: true }));
  mobileLayout.addEventListener("change", () => update({ immediate: true }));
}

setupSayHelloScrollReveal();

function setupStickerCardMotion() {
  const cards = [...document.querySelectorAll("[data-sticker-card]")];
  if (!cards.length) return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const autoplayCard = document.querySelector("[data-sticker-autoplay]");
  const autoplayShowcase = autoplayCard?.closest(".sticker-showcase");
  const sourceResetTimers = new WeakMap();
  let activeCard = null;
  let autoplayObserver = null;
  let autoplayStartTimer = 0;
  let autoplayStopTimer = 0;
  let autoplayRunning = false;

  function cancelAutoplay({ deactivatePreview = false } = {}) {
    if (autoplayStartTimer) window.clearTimeout(autoplayStartTimer);
    if (autoplayStopTimer) window.clearTimeout(autoplayStopTimer);
    autoplayStartTimer = 0;
    autoplayStopTimer = 0;
    autoplayObserver?.disconnect();
    autoplayObserver = null;

    if (deactivatePreview && autoplayRunning && activeCard === autoplayCard) {
      deactivate(autoplayCard, { immediate: true });
    }
    autoplayRunning = false;
  }

  function clearSourceReset(card) {
    const timer = sourceResetTimers.get(card);
    if (!timer) return;
    window.clearTimeout(timer);
    sourceResetTimers.delete(card);
  }

  function deactivate(card, { immediate = false } = {}) {
    if (!card) return;

    const motion = card.querySelector(".sticker-card-motion");
    card.classList.remove("is-active", "is-motion-ready");
    card.setAttribute("aria-pressed", "false");
    if (activeCard === card) activeCard = null;
    clearSourceReset(card);

    const resetSource = () => {
      if (!card.classList.contains("is-active")) motion?.removeAttribute("src");
      sourceResetTimers.delete(card);
    };

    if (immediate) resetSource();
    else sourceResetTimers.set(card, window.setTimeout(resetSource, 220));
  }

  function activate(card) {
    if (!card || reduceMotionQuery.matches) return;
    if (activeCard && activeCard !== card) deactivate(activeCard, { immediate: true });

    const motion = card.querySelector(".sticker-card-motion");
    const source = card.dataset.motionSrc;
    if (!motion || !source) return;

    clearSourceReset(card);
    activeCard = card;
    card.classList.add("is-active");
    card.setAttribute("aria-pressed", "true");

    if (motion.getAttribute("src") !== source) {
      card.classList.remove("is-motion-ready");
      motion.src = source;
    }

    if (motion.complete && motion.naturalWidth) {
      window.requestAnimationFrame(() => {
        if (activeCard === card) card.classList.add("is-motion-ready");
      });
    }
  }

  cards.forEach((card) => {
    const motion = card.querySelector(".sticker-card-motion");

    motion?.addEventListener("load", () => {
      if (activeCard === card && card.classList.contains("is-active")) {
        card.classList.add("is-motion-ready");
      }
    });

    card.addEventListener("pointerenter", () => {
      if (desktopPointer.matches) {
        cancelAutoplay();
        activate(card);
      }
    });

    card.addEventListener("pointerleave", () => {
      if (desktopPointer.matches && document.activeElement !== card) deactivate(card);
    });

    card.addEventListener("focus", () => {
      if (desktopPointer.matches && card.matches(":focus-visible")) {
        cancelAutoplay();
        activate(card);
      }
    });

    card.addEventListener("blur", () => deactivate(card));

    card.addEventListener("click", () => {
      if (desktopPointer.matches || reduceMotionQuery.matches) return;
      cancelAutoplay();
      if (activeCard === card) deactivate(card);
      else activate(card);
    });
  });

  if (autoplayCard && autoplayShowcase && !reduceMotionQuery.matches) {
    autoplayObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting || entry.intersectionRatio < 0.35) return;

      autoplayObserver?.disconnect();
      autoplayObserver = null;
      autoplayStartTimer = window.setTimeout(() => {
        autoplayStartTimer = 0;
        autoplayRunning = true;
        activate(autoplayCard);
        autoplayStopTimer = window.setTimeout(() => {
          autoplayStopTimer = 0;
          if (activeCard === autoplayCard) deactivate(autoplayCard);
          autoplayRunning = false;
        }, 2200);
      }, 320);
    }, { threshold: [0.35] });

    autoplayObserver.observe(autoplayShowcase);
  }

  document.addEventListener("pointerdown", (event) => {
    if (desktopPointer.matches || !activeCard || event.target.closest("[data-sticker-card]")) return;
    deactivate(activeCard);
  }, { passive: true });

  reduceMotionQuery.addEventListener("change", () => {
    if (reduceMotionQuery.matches) {
      cancelAutoplay({ deactivatePreview: true });
      deactivate(activeCard, { immediate: true });
    }
  });
}

setupStickerCardMotion();
