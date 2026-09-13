const body = document.body;
const siteHeader = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-toggle]");
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const sections = [...document.querySelectorAll("[data-section]")];
const revealItems = document.querySelectorAll(".reveal");
const titleReveals = document.querySelectorAll(".work-title-reveal, [data-title-reveal]");
const contactToggle = document.querySelector("[data-contact-toggle]");
const contactPopover = document.querySelector("[data-contact-toggle] + .contact-popover");
const contactControl = contactToggle?.closest(".contact-control");
const ctaContactToggle = document.querySelector("[data-cta-contact-toggle]");
const ctaContactPopover = document.querySelector("#cta-contact-popover");
const ctaContactControl = ctaContactToggle?.closest(".cta-contact-control");
const copyWechatButtons = [...document.querySelectorAll("[data-copy-wechat]")];
const copyFeedbackTimers = new WeakMap();
const tagButtons = [...document.querySelectorAll("[data-tag]")];
const tagStatus = document.querySelector(".tag-status");
const workCards = [...document.querySelectorAll("[data-work-card]")];

function splitNavLabels() {
  [...navLinks, contactToggle].forEach((element) => {
    if (!element || element.querySelector(".nav-roll")) return;
    const label = element.textContent.trim();
    element.setAttribute("aria-label", label);
    element.innerHTML = `<span class="nav-roll" aria-hidden="true"><span>${label}</span><span>${label}</span></span>`;
  });
}

splitNavLabels();

function closeMenu() {
  body.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "打开导航");
}

menuButton.addEventListener("click", () => {
  const nextOpenState = !body.classList.contains("menu-open");
  body.classList.toggle("menu-open", nextOpenState);
  if (nextOpenState) siteHeader?.classList.remove("is-hidden");
  menuButton.setAttribute("aria-expanded", String(nextOpenState));
  menuButton.setAttribute("aria-label", nextOpenState ? "关闭导航" : "打开导航");
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

function closeContactPopover() {
  [
    [contactPopover, contactToggle],
    [ctaContactPopover, ctaContactToggle],
  ].forEach(([popover, toggle]) => {
    if (!popover || !toggle) return;
    popover.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
}

contactToggle.addEventListener("click", () => {
  const nextOpenState = !contactPopover.classList.contains("is-open");
  closeContactPopover();
  contactPopover.classList.toggle("is-open", nextOpenState);
  contactToggle.setAttribute("aria-expanded", String(nextOpenState));
});

const desktopContactLayout = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");

contactControl?.addEventListener("pointerleave", () => {
  if (!desktopContactLayout.matches) return;
  closeContactPopover();
});

window.addEventListener("pointermove", (event) => {
  if (!desktopContactLayout.matches || !contactControl || !contactPopover?.classList.contains("is-open")) {
    return;
  }

  const controlBounds = contactControl.getBoundingClientRect();
  const popoverBounds = contactPopover.getBoundingClientRect();
  const surface = {
    left: Math.min(controlBounds.left, popoverBounds.left),
    right: Math.max(controlBounds.right, popoverBounds.right),
    top: Math.min(controlBounds.top, popoverBounds.top),
    bottom: Math.max(controlBounds.bottom, popoverBounds.bottom),
  };
  const isInsideSurface = event.clientX >= surface.left
    && event.clientX <= surface.right
    && event.clientY >= surface.top
    && event.clientY <= surface.bottom;

  if (!isInsideSurface) closeContactPopover();
}, { passive: true });

const touchContactLayout = window.matchMedia("(max-width: 900px), (hover: none), (pointer: coarse)");

ctaContactToggle?.addEventListener("click", () => {
  if (!ctaContactPopover) return;
  const nextOpenState = !ctaContactPopover.classList.contains("is-open");
  closeContactPopover();
  ctaContactPopover.classList.toggle("is-open", nextOpenState);
  ctaContactToggle.setAttribute("aria-expanded", String(nextOpenState));
});

ctaContactToggle?.addEventListener("focus", () => {
  if (!desktopContactLayout.matches || !ctaContactPopover) return;
  ctaContactToggle.setAttribute("aria-expanded", "true");
});

ctaContactControl?.addEventListener("pointerleave", () => {
  if (!desktopContactLayout.matches) return;
  ctaContactToggle?.blur();
  closeContactPopover();
});

window.addEventListener("pointermove", (event) => {
  if (!desktopContactLayout.matches || !ctaContactControl || !ctaContactPopover?.classList.contains("is-open")) {
    return;
  }

  const controlBounds = ctaContactControl.getBoundingClientRect();
  const popoverBounds = ctaContactPopover.getBoundingClientRect();
  const surface = {
    left: Math.min(controlBounds.left, popoverBounds.left),
    right: Math.max(controlBounds.right, popoverBounds.right),
    top: Math.min(controlBounds.top, popoverBounds.top),
    bottom: Math.max(controlBounds.bottom, popoverBounds.bottom),
  };
  const isInsideSurface = event.clientX >= surface.left
    && event.clientX <= surface.right
    && event.clientY >= surface.top
    && event.clientY <= surface.bottom;

  if (!isInsideSurface) {
    ctaContactToggle?.blur();
    closeContactPopover();
  }
}, { passive: true });

ctaContactControl?.addEventListener("focusout", (event) => {
  if (!desktopContactLayout.matches || ctaContactControl.contains(event.relatedTarget)) return;
  closeContactPopover();
});

async function copyWechatId(button) {
  const value = "Hangz-zai";
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const input = document.createElement("textarea");
    input.value = value;
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
  window.clearTimeout(copyFeedbackTimers.get(button));
  const feedbackTimer = window.setTimeout(() => {
    button.classList.remove("is-copied");
    button.setAttribute("aria-label", "复制微信号");
    copyFeedbackTimers.delete(button);
  }, 1400);
  copyFeedbackTimers.set(button, feedbackTimer);
}

copyWechatButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    copyWechatId(button);
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".contact-control, .cta-contact-control")) {
    closeContactPopover();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeContactPopover();
  closeMenu();
});

const desktopBreakpoint = window.matchMedia("(min-width: 901px)");

desktopBreakpoint.addEventListener("change", (event) => {
  if (!event.matches) return;
  closeMenu();
  closeContactPopover();
});

function setupAdaptiveHeader() {
  if (!siteHeader) return;

  const glassThreshold = 80;
  const hideStart = 160;
  const hideTravel = 36;
  const showTravel = 14;
  let lastScrollY = Math.max(0, window.scrollY);
  let direction = 0;
  let directionTravel = 0;
  let animationFrame = 0;

  function updateHeader() {
    const currentScrollY = Math.max(0, window.scrollY);
    const delta = currentScrollY - lastScrollY;
    const nextDirection = delta > 0 ? 1 : delta < 0 ? -1 : direction;

    if (nextDirection !== direction) {
      direction = nextDirection;
      directionTravel = 0;
    }
    directionTravel += Math.abs(delta);

    const isAtTop = currentScrollY <= glassThreshold;
    siteHeader.classList.toggle("is-scrolled", !isAtTop);

    if (isAtTop || body.classList.contains("menu-open")) {
      siteHeader.classList.remove("is-hidden");
    } else if (direction > 0 && currentScrollY >= hideStart && directionTravel >= hideTravel) {
      siteHeader.classList.add("is-hidden");
      closeContactPopover();
      directionTravel = 0;
    } else if (direction < 0 && directionTravel >= showTravel) {
      siteHeader.classList.remove("is-hidden");
      directionTravel = 0;
    }

    lastScrollY = currentScrollY;
    animationFrame = 0;
  }

  function scheduleHeaderUpdate() {
    if (animationFrame) return;
    animationFrame = window.requestAnimationFrame(updateHeader);
  }

  window.addEventListener("scroll", scheduleHeaderUpdate, { passive: true });
  updateHeader();
}

setupAdaptiveHeader();

tagButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tagButtons.forEach((tag) => tag.classList.remove("is-active"));
    button.classList.add("is-active");
    tagStatus.textContent = `Selected: ${button.dataset.tag}`;
  });
});

function activateWorkCard(card) {
  const nextActiveState = !card.classList.contains("is-active");
  workCards.forEach((item) => {
    item.classList.remove("is-active");
    item.setAttribute("aria-pressed", "false");
  });
  card.classList.toggle("is-active", nextActiveState);
  card.setAttribute("aria-pressed", String(nextActiveState));
}

workCards.forEach((card) => {
  card.addEventListener("click", () => activateWorkCard(card));
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateWorkCard(card);
  });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle(
          "is-active",
          link.getAttribute("href") === `#${entry.target.id}`,
        );
      });
    });
  },
  { rootMargin: "-35% 0px -55%", threshold: 0 },
);

sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.14 },
);

revealItems.forEach((item) => revealObserver.observe(item));

const workTitleObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-title-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.25,
  },
);

titleReveals.forEach((title) => workTitleObserver.observe(title));

// Hash navigation and late-loading fonts can shift a section after the
// initial observer pass. Re-check the viewport once layout has settled so
// directly opened sections never remain hidden.
function revealVisibleContent() {
  const viewportBottom = window.innerHeight * 1.08;
  const titleTriggerLine = window.innerHeight * 0.9;
  const minimumTitleVisibility = 0.25;
  revealItems.forEach((item) => {
    const bounds = item.getBoundingClientRect();
    if (bounds.top < viewportBottom && bounds.bottom > -40) {
      item.classList.add("is-visible");
    }
  });

  titleReveals.forEach((title) => {
    const bounds = title.getBoundingClientRect();
    const visibleHeight = Math.max(
      0,
      Math.min(bounds.bottom, titleTriggerLine) - Math.max(bounds.top, 0),
    );
    const visibleRatio = bounds.height > 0 ? visibleHeight / bounds.height : 0;
    if (bounds.top < titleTriggerLine && visibleRatio >= minimumTitleVisibility) {
      title.classList.add("is-title-visible");
    }
  });
}

function scheduleRevealCheck() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(revealVisibleContent);
  });
}

window.addEventListener("hashchange", scheduleRevealCheck);
window.addEventListener("load", scheduleRevealCheck);
scheduleRevealCheck();
if (document.fonts?.ready) document.fonts.ready.then(scheduleRevealCheck);

function setupHeroTitleLight() {
  const hero = document.querySelector(".hero");
  const title = document.querySelector("[data-hero-light-title]");
  const baseLayer = title?.querySelector(".hero-title-base");
  if (!hero || !title || !baseLayer) return;

  const baseGlyphs = [...baseLayer.querySelectorAll("[data-hero-glyph]")];
  const outlineLayer = document.createElement("div");
  outlineLayer.className = "hero-title-layer hero-title-outline-layer";
  outlineLayer.setAttribute("aria-hidden", "true");

  const lightLayer = document.createElement("div");
  lightLayer.className = "hero-title-layer hero-title-light-layer";
  lightLayer.setAttribute("aria-hidden", "true");

  baseGlyphs.forEach((glyph, index) => {
    const outline = glyph.cloneNode(false);
    outline.removeAttribute("data-hero-glyph");
    outline.setAttribute("src", `assets/svg/hero/描边 ${index + 1}.svg?v=outline-100-2`);
    outlineLayer.append(outline);
    lightLayer.append(outline.cloneNode(false));
  });
  title.append(outlineLayer);
  title.append(lightLayer);

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const desktopViewport = window.matchMedia("(min-width: 901px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: 5, y: 8, targetX: 5, targetY: 8 };
  const idleFrameInterval = 1000 / 30;
  const idleLightSpeed = 1.25;
  let animationFrame = 0;
  let heroVisible = true;
  let mode = "idle";
  let idleStartedAt = 0;
  let lastIdlePaint = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function canAnimateLight() {
    return !reduceMotion.matches;
  }

  function canPointerTakeOver() {
    return canAnimateLight() && finePointer.matches && desktopViewport.matches;
  }

  function applyLightPosition(x, y) {
    lightLayer.style.setProperty("--light-x", `${x}%`);
    lightLayer.style.setProperty("--light-y", `${y}%`);
  }

  function stopLightFrame() {
    if (!animationFrame) return;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function shouldAnimateLight() {
    return canAnimateLight() && heroVisible && !document.hidden && mode !== "static";
  }

  function scheduleLightFrame() {
    if (animationFrame || !shouldAnimateLight()) return;
    animationFrame = window.requestAnimationFrame(drawLight);
  }

  function getIdleTarget(timestamp) {
    const seconds = (Math.max(0, timestamp - idleStartedAt) / 1000) * idleLightSpeed;
    return {
      x: clamp(50 + Math.sin(seconds * 0.68 - 1.4) * 36 + Math.sin(seconds * 0.24 + 0.6) * 7, 6, 94),
      y: clamp(46 + Math.sin(seconds * 0.49 - 1.1) * 26 + Math.cos(seconds * 0.29 + 1.8) * 9, 7, 91),
    };
  }

  function drawLight(timestamp) {
    animationFrame = 0;
    if (!shouldAnimateLight()) return;

    if (mode === "idle" && timestamp - lastIdlePaint < idleFrameInterval) {
      scheduleLightFrame();
      return;
    }

    const target = mode === "pointer"
      ? { x: pointer.targetX, y: pointer.targetY }
      : getIdleTarget(timestamp);
    const easing = mode === "pointer" ? 0.24 : 0.075;
    pointer.x += (target.x - pointer.x) * easing;
    pointer.y += (target.y - pointer.y) * easing;
    applyLightPosition(pointer.x, pointer.y);
    if (mode === "idle") lastIdlePaint = timestamp;
    scheduleLightFrame();
  }

  function beginIdleLight() {
    if (!canAnimateLight()) return;
    mode = "idle";
    if (!idleStartedAt) idleStartedAt = performance.now();
    title.classList.remove("is-pointer-interacting");
    title.classList.add("is-light-active", "is-idle-light");
    scheduleLightFrame();
  }

  function useStaticLight() {
    stopLightFrame();
    mode = "static";
    pointer.x = 11;
    pointer.y = 9;
    pointer.targetX = 11;
    pointer.targetY = 9;
    applyLightPosition(pointer.x, pointer.y);
    title.classList.remove("is-pointer-interacting", "is-idle-light");
    title.classList.add("is-light-active");
  }

  function takePointerControl(event) {
    if (!canPointerTakeOver() || !heroVisible || document.hidden) return;
    const titleBounds = title.getBoundingClientRect();
    const isInsideTitle = event.clientX >= titleBounds.left
      && event.clientX <= titleBounds.right
      && event.clientY >= titleBounds.top
      && event.clientY <= titleBounds.bottom;

    if (!isInsideTitle) {
      if (mode === "pointer") beginIdleLight();
      return;
    }

    mode = "pointer";
    title.classList.remove("is-idle-light");
    title.classList.add("is-pointer-interacting", "is-light-active");
    pointer.targetX = clamp(((event.clientX - titleBounds.left) / titleBounds.width) * 100, -8, 108);
    pointer.targetY = clamp(((event.clientY - titleBounds.top) / titleBounds.height) * 100, -12, 112);
    scheduleLightFrame();
  }

  function handleMotionCapabilityChange() {
    if (!canAnimateLight()) {
      useStaticLight();
      return;
    }

    if (mode === "pointer" && !canPointerTakeOver()) mode = "idle";
    idleStartedAt = performance.now();
    beginIdleLight();
  }

  function handleVisibilityChange() {
    if (document.hidden || !heroVisible) {
      if (mode === "pointer") beginIdleLight();
      stopLightFrame();
    } else {
      scheduleLightFrame();
    }
  }

  if (!canAnimateLight()) {
    useStaticLight();
  } else {
    idleStartedAt = performance.now();
    beginIdleLight();
  }

  const heroObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    handleVisibilityChange();
  }, { threshold: 0.04 });
  heroObserver.observe(hero);

  window.addEventListener("pointermove", takePointerControl, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => {
    if (mode === "pointer") beginIdleLight();
  });
  window.addEventListener("blur", () => {
    if (mode === "pointer") beginIdleLight();
  });
  document.addEventListener("visibilitychange", handleVisibilityChange);
  finePointer.addEventListener("change", handleMotionCapabilityChange);
  desktopViewport.addEventListener("change", handleMotionCapabilityChange);
  reduceMotion.addEventListener("change", handleMotionCapabilityChange);
}

setupHeroTitleLight();

function setupCtaMotion() {
  const ctaPanel = document.querySelector(".cta-panel");
  const canvas = ctaPanel?.querySelector(".cta-canvas");
  const pointerOrb = ctaPanel?.querySelector(".cta-pointer-orb");
  if (!ctaPanel || !canvas || !pointerOrb) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const glyphs = [".", ":", "+", "*", "#", "%", "$", "@"]; 
  const pointer = { x: 0.5, y: 0.46, targetX: 0.5, targetY: 0.46 };
  const disturbance = { x: 0.5, y: 0.46, strength: 0, velocityX: 0, velocityY: 0 };
  let width = 0;
  let height = 0;
  let frameId = 0;
  let isInView = false;
  let lastScrollY = window.scrollY;
  let scrollMomentum = 0;
  let reducedMotion = reduceMotionQuery.matches;
  let pointerActive = false;
  let touchActive = false;
  const touchLayout = window.matchMedia("(max-width: 900px), (hover: none), (pointer: coarse)");
  let touchViewport = touchLayout.matches;

  function resizeCanvas() {
    const bounds = ctaPanel.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function smoothstep(edge0, edge1, value) {
    const amount = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return amount * amount * (3 - 2 * amount);
  }

  function hash(column, row) {
    const value = Math.sin(column * 127.1 + row * 311.7) * 43758.5453;
    return value - Math.floor(value);
  }

  function drawFrame(time) {
    if (!width || !height) return;

    const spacing = width < 560 ? 12 : 14;
    const fontSize = width < 560 ? 8 : 9;
    const phase = reducedMotion ? 0.9 : time * 0.00024 + scrollMomentum * 0.004;
    const pointerX = pointer.x * width;
    const pointerY = pointer.y * height;
    const disturbanceX = disturbance.x * width;
    const disturbanceY = disturbance.y * height;
    const interactionRadius = width < 560
      ? Math.min(width * 0.62, 245)
      : Math.min(width * 0.23, 310);

    const pulse = 0.5 + Math.sin(phase * 1.75) * 0.5;
    const centerX = width * (0.5 + Math.sin(phase * 0.63) * 0.055);
    const centerY = height * (0.49 + Math.cos(phase * 0.52) * 0.035);
    const radiusX = width * (0.25 + pulse * 0.09);
    const radiusY = height * (0.29 + (1 - pulse) * 0.14);

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#101010";
    context.fillRect(0, 0, width, height);
    context.font = `${fontSize}px "SFMono-Regular", "Roboto Mono", Menlo, monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";

    const columns = Math.ceil(width / spacing) + 2;
    const rows = Math.ceil(height / spacing) + 2;

    for (let row = -1; row < rows; row += 1) {
      const baseY = row * spacing + spacing * 0.5;
      for (let column = -1; column < columns; column += 1) {
        const baseX = column * spacing + spacing * 0.5;
        const sampleX = baseX
          + Math.sin(baseY * 0.0105 + phase * 2.1) * 26
          + Math.cos(baseX * 0.0055 - phase * 1.45) * 12;
        const sampleY = baseY
          + Math.cos(baseX * 0.0082 - phase * 1.72) * 18
          + Math.sin(baseY * 0.006 + phase * 1.1) * 10;
        const normalizedX = (sampleX - centerX) / radiusX;
        const normalizedY = (sampleY - centerY) / radiusY;
        const radial = Math.hypot(normalizedX, normalizedY);
        const edge = 1 - smoothstep(0.58, 1.68, radial);
        const innerWave = Math.sin(
          normalizedX * 7.4
          - normalizedY * 5.2
          + phase * 4.4
          + Math.sin(normalizedY * 3.1 - phase) * 1.2
        );
        const crossWave = Math.cos(normalizedX * 3.8 + normalizedY * 7.2 - phase * 2.7);
        const grain = hash(column, row);
        const fieldTone = clamp(edge * (0.54 + innerWave * 0.22 + crossWave * 0.12) + grain * 0.12, 0, 1);

        const distanceToPointer = Math.hypot(baseX - disturbanceX, baseY - disturbanceY);
        const pointerFocus = disturbance.strength
          * (1 - smoothstep(interactionRadius * 0.18, interactionRadius, distanceToPointer));
        const pointerAngle = Math.atan2(baseY - disturbanceY, baseX - disturbanceX);
        const pointerRipple = Math.sin(distanceToPointer * 0.055 - phase * 12) * pointerFocus;
        const pointerPush = (12 + pointerRipple * 11) * pointerFocus;
        const dragX = disturbance.velocityX * 36 * pointerFocus;
        const dragY = disturbance.velocityY * 36 * pointerFocus;

        const streamX = reducedMotion
          ? 0
          : Math.sin(baseY * 0.011 + phase * 2.2 + Math.sin(baseX * 0.004) * 1.4) * 5.2;
        const streamY = reducedMotion
          ? 0
          : Math.cos(baseX * 0.008 - phase * 1.8 + Math.sin(baseY * 0.005) * 1.6) * 4.4;
        const drawX = baseX + streamX + Math.cos(pointerAngle) * pointerPush + dragX;
        const drawY = baseY + streamY + Math.sin(pointerAngle) * pointerPush + dragY;

        const interactionLight = pointerFocus * 0.22;
        const opacity = clamp(0.012 + fieldTone * 0.31 + interactionLight * 0.72, 0.01, 0.39);
        if (opacity < 0.028 && grain > 0.32) continue;

        const tone = Math.round(148 + fieldTone * 38 + pointerFocus * 24);
        context.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${opacity})`;
        const glyphTone = clamp(fieldTone + pointerRipple * 0.1 + pointerFocus * 0.16, 0, 1);
        const glyphIndex = Math.min(glyphs.length - 1, Math.floor(glyphTone * glyphs.length));
        context.fillText(glyphs[glyphIndex], drawX, drawY);
      }
    }

    const nextX = pointer.x * width;
    const nextY = pointer.y * height;
    pointerOrb.style.left = `${nextX}px`;
    pointerOrb.style.top = `${nextY}px`;
  }

  function animate(time) {
    const previousX = pointer.x;
    const previousY = pointer.y;
    pointer.x += (pointer.targetX - pointer.x) * 0.16;
    pointer.y += (pointer.targetY - pointer.y) * 0.16;
    disturbance.x += (pointer.x - disturbance.x) * (pointerActive ? 0.19 : 0.055);
    disturbance.y += (pointer.y - disturbance.y) * (pointerActive ? 0.19 : 0.055);
    disturbance.velocityX += ((pointer.x - previousX) - disturbance.velocityX) * 0.32;
    disturbance.velocityY += ((pointer.y - previousY) - disturbance.velocityY) * 0.32;
    disturbance.velocityX *= 0.9;
    disturbance.velocityY *= 0.9;
    disturbance.strength += ((pointerActive ? 1 : 0) - disturbance.strength) * (pointerActive ? 0.2 : 0.035);
    scrollMomentum *= 0.92;
    drawFrame(time);

    if (isInView && !reducedMotion) {
      frameId = window.requestAnimationFrame(animate);
    }
  }

  function startAnimation() {
    if (frameId || !isInView) return;
    frameId = window.requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (!frameId) return;
    window.cancelAnimationFrame(frameId);
    frameId = 0;
  }

  function setPointer(event) {
    const bounds = ctaPanel.getBoundingClientRect();
    pointer.targetX = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    pointer.targetY = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
    pointerActive = true;
    if (disturbance.strength < 0.01) {
      disturbance.x = pointer.targetX;
      disturbance.y = pointer.targetY;
    }
    ctaPanel.classList.add("is-pointer-active");
    startAnimation();
  }

  function isCtaBackground(event) {
    return !event.target.closest(".cta-content");
  }

  function resetPointer() {
    pointerActive = false;
    ctaPanel.classList.remove("is-pointer-active");
    pointer.targetX = 0.5;
    pointer.targetY = 0.46;
    if (reducedMotion) drawFrame(0);
  }

  ctaPanel.addEventListener("pointerdown", (event) => {
    if (!touchViewport || !isCtaBackground(event)) return;
    touchActive = true;
    ctaPanel.setPointerCapture?.(event.pointerId);
    setPointer(event);
  }, { passive: true });

  ctaPanel.addEventListener("pointermove", (event) => {
    if (touchViewport) {
      if (touchActive) setPointer(event);
      return;
    }
    setPointer(event);
  }, { passive: true });

  ctaPanel.addEventListener("pointerenter", (event) => {
    if (!touchViewport) setPointer(event);
  }, { passive: true });

  ctaPanel.addEventListener("pointerup", (event) => {
    if (!touchViewport) return;
    touchActive = false;
    ctaPanel.releasePointerCapture?.(event.pointerId);
    resetPointer();
  }, { passive: true });

  ctaPanel.addEventListener("pointercancel", (event) => {
    if (!touchViewport) return;
    touchActive = false;
    ctaPanel.releasePointerCapture?.(event.pointerId);
    resetPointer();
  }, { passive: true });

  ctaPanel.addEventListener("pointerleave", () => {
    if (touchViewport && touchActive) return;
    resetPointer();
  });

  window.addEventListener("scroll", () => {
    const nextScrollY = window.scrollY;
    scrollMomentum += clamp(nextScrollY - lastScrollY, -80, 80);
    lastScrollY = nextScrollY;
    startAnimation();
  }, { passive: true });

  window.addEventListener("resize", () => {
    touchViewport = touchLayout.matches;
    resizeCanvas();
    drawFrame(0);
  }, { passive: true });

  reduceMotionQuery.addEventListener("change", (event) => {
    reducedMotion = event.matches;
    if (reducedMotion) {
      stopAnimation();
      drawFrame(0);
    } else {
      startAnimation();
    }
  });

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    isInView = entry.isIntersecting;
    if (isInView) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, { threshold: 0.01 });

  resizeCanvas();
  drawFrame(0);
  visibilityObserver.observe(ctaPanel);
}

setupCtaMotion();

function setupFooterScrollReveal() {
  const banner = document.querySelector("[data-footer-reveal-anchor]");
  const footer = document.querySelector("[data-footer-reveal]");
  if (!banner || !footer) return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLayout = window.matchMedia("(max-width: 900px)");
  let currentOffset = 0;
  let targetOffset = 0;
  let frameId = 0;
  let initialized = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function measureTarget() {
    if (reduceMotionQuery.matches) return 0;

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const remainingScroll = Math.max(0, maxScroll - window.scrollY);
    const revealTravel = mobileLayout.matches ? 230 : 380;
    const revealOffset = mobileLayout.matches ? 76 : 148;
    const progress = clamp(1 - remainingScroll / revealTravel, 0, 1);
    return -revealOffset * (1 - progress);
  }

  function render() {
    currentOffset += (targetOffset - currentOffset) * 0.18;

    if (Math.abs(targetOffset - currentOffset) < 0.08) {
      currentOffset = targetOffset;
    }

    footer.style.setProperty("--footer-reveal-y", `${currentOffset.toFixed(2)}px`);

    if (currentOffset !== targetOffset) {
      frameId = window.requestAnimationFrame(render);
    } else {
      frameId = 0;
    }
  }

  function updateTarget({ immediate = false } = {}) {
    targetOffset = measureTarget();

    if (immediate || !initialized) {
      initialized = true;
      currentOffset = targetOffset;
      footer.style.setProperty("--footer-reveal-y", `${currentOffset.toFixed(2)}px`);
      return;
    }

    if (!frameId) frameId = window.requestAnimationFrame(render);
  }

  footer.classList.add("is-scroll-reveal");
  updateTarget({ immediate: true });

  window.addEventListener("scroll", () => updateTarget(), { passive: true });
  window.addEventListener("resize", () => updateTarget({ immediate: true }), { passive: true });

  reduceMotionQuery.addEventListener("change", () => updateTarget({ immediate: true }));
  mobileLayout.addEventListener("change", () => updateTarget({ immediate: true }));
}

setupFooterScrollReveal();

function setupHeroBannerFold() {
  const shell = document.querySelector("[data-hero-banner-fold]");
  const banner = shell?.querySelector(".hero-transition-banner");
  if (!shell || !banner) return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLayout = window.matchMedia("(max-width: 900px)");
  let currentInset = 0;
  let targetInset = 0;
  let frameId = 0;
  let initialized = false;
  let bannerHeight = 0;
  const about = document.querySelector("#about");

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function measureTarget() {
    if (reduceMotionQuery.matches) return 0;

    const shellTop = shell.getBoundingClientRect().top + window.scrollY;
    const startScroll = shellTop - window.innerHeight * (mobileLayout.matches ? 0.78 : 0.82);
    const endScroll = shellTop - window.innerHeight * (mobileLayout.matches ? 0.4 : 0.38);
    const progress = clamp((window.scrollY - startScroll) / (endScroll - startScroll), 0, 1);
    const maxInset = mobileLayout.matches ? 54 : 58;
    return progress * maxInset;
  }

  function applyFold() {
    const foldedSpace = bannerHeight * (currentInset / 100);
    banner.style.setProperty("--hero-banner-fold", `${currentInset.toFixed(2)}%`);
    shell.style.setProperty("--hero-banner-fold-space", `${foldedSpace.toFixed(2)}px`);
  }

  function alignAboutAnchor(behavior = "smooth") {
    if (!about || !bannerHeight) return;

    const header = document.querySelector("[data-header]");
    const headerOffset = header?.getBoundingClientRect().height || (mobileLayout.matches ? 72 : 88);
    const currentFoldSpace = bannerHeight * (currentInset / 100);
    const naturalAboutTop = about.getBoundingClientRect().top + window.scrollY + currentFoldSpace;
    const finalFoldSpace = bannerHeight * ((mobileLayout.matches ? 54 : 58) / 100);
    const targetScroll = Math.max(0, naturalAboutTop - finalFoldSpace - headerOffset);

    window.scrollTo({
      top: targetScroll,
      behavior: reduceMotionQuery.matches ? "auto" : behavior,
    });
  }

  function render() {
    currentInset += (targetInset - currentInset) * 0.2;

    if (Math.abs(targetInset - currentInset) < 0.06) {
      currentInset = targetInset;
    }

    applyFold();

    if (currentInset !== targetInset) {
      frameId = window.requestAnimationFrame(render);
    } else {
      frameId = 0;
    }
  }

  function updateTarget({ immediate = false } = {}) {
    targetInset = measureTarget();

    if (immediate || !initialized) {
      initialized = true;
      bannerHeight = banner.getBoundingClientRect().height;
      currentInset = targetInset;
      applyFold();
      return;
    }

    if (!frameId) frameId = window.requestAnimationFrame(render);
  }

  updateTarget({ immediate: true });

  document.querySelectorAll('a[href="#about"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.history.pushState({}, "", "#about");
      alignAboutAnchor();
    });
  });

  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#about") alignAboutAnchor("auto");
  });

  if (window.location.hash === "#about") {
    window.setTimeout(() => alignAboutAnchor("auto"), 0);
  }

  window.addEventListener("scroll", () => updateTarget(), { passive: true });
  window.addEventListener("resize", () => updateTarget({ immediate: true }), { passive: true });

  reduceMotionQuery.addEventListener("change", () => updateTarget({ immediate: true }));
  mobileLayout.addEventListener("change", () => updateTarget({ immediate: true }));
}

setupHeroBannerFold();

function setupWorkCtaFold() {
  const shell = document.querySelector("[data-work-cta-fold]");
  const ctaPanel = shell?.querySelector(".cta-panel");
  if (!shell || !ctaPanel) return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLayout = window.matchMedia("(max-width: 900px)");
  let currentFold = 0;
  let targetFold = 0;
  let frameId = 0;
  let initialized = false;
  let panelHeight = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function measurePanel() {
    panelHeight = Math.max(1, ctaPanel.getBoundingClientRect().height);
    shell.style.setProperty("--cta-fold-height", `${panelHeight.toFixed(2)}px`);
  }

  function measureTarget() {
    if (reduceMotionQuery.matches || !panelHeight) return 0;

    const shellTop = shell.getBoundingClientRect().top + window.scrollY;
    const startScroll = shellTop - window.innerHeight * (mobileLayout.matches ? 0.9 : 0.86);
    const endScroll = shellTop - window.innerHeight * (mobileLayout.matches ? 0.44 : 0.36);
    const progress = clamp((window.scrollY - startScroll) / (endScroll - startScroll), 0, 1);
    const maxFold = mobileLayout.matches ? 0.22 : 0.26;
    return maxFold * (1 - progress);
  }

  function applyFold() {
    const foldSpace = panelHeight * currentFold;
    shell.style.setProperty("--cta-fold-space", `${foldSpace.toFixed(2)}px`);
    shell.style.setProperty("--cta-fold-progress", currentFold.toFixed(4));
  }

  function render() {
    currentFold += (targetFold - currentFold) * 0.18;

    if (Math.abs(targetFold - currentFold) < 0.001) {
      currentFold = targetFold;
    }

    applyFold();

    if (currentFold !== targetFold) {
      frameId = window.requestAnimationFrame(render);
    } else {
      frameId = 0;
    }
  }

  function updateTarget({ immediate = false } = {}) {
    measurePanel();
    targetFold = measureTarget();

    if (immediate || !initialized) {
      initialized = true;
      currentFold = targetFold;
      applyFold();
      return;
    }

    if (!frameId) frameId = window.requestAnimationFrame(render);
  }

  shell.classList.add("is-scroll-fold");
  updateTarget({ immediate: true });

  window.addEventListener("scroll", () => updateTarget(), { passive: true });
  window.addEventListener("resize", () => updateTarget({ immediate: true }), { passive: true });
  reduceMotionQuery.addEventListener("change", () => updateTarget({ immediate: true }));
  mobileLayout.addEventListener("change", () => updateTarget({ immediate: true }));
}

setupWorkCtaFold();

function setupCtaContentScrollReveal() {
  const shell = document.querySelector("[data-work-cta-fold]");
  const ctaPanel = shell?.querySelector(".cta-panel");
  const content = ctaPanel?.querySelector("[data-cta-content]");
  const firstLine = content?.querySelector('[data-cta-line="1"]');
  const secondLine = content?.querySelector('[data-cta-line="2"]');
  const action = content?.querySelector(".cta-contact-control");
  const brackets = ctaPanel ? [...ctaPanel.querySelectorAll(".cta-bracket")] : [];
  if (!shell || !ctaPanel || !content || !firstLine || !secondLine || !action) return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLayout = window.matchMedia("(max-width: 900px)");
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

    const shellTop = shell.getBoundingClientRect().top + window.scrollY;
    const viewport = window.innerHeight;
    // Start while the CTA is just entering the viewport, so its first line
    // is visible near the top of the new panel instead of arriving late.
    const start = shellTop - viewport * (mobileLayout.matches ? 0.88 : 0.94);
    const travel = viewport * (mobileLayout.matches ? 1.08 : 0.96);
    return clamp((window.scrollY - start) / travel, 0, 1);
  }

  function render() {
    currentProgress += (targetProgress - currentProgress) * 0.2;

    if (Math.abs(targetProgress - currentProgress) < 0.001) {
      currentProgress = targetProgress;
    }

    const lineOneProgress = smoothstep(currentProgress / 0.34);
    const lineTwoProgress = smoothstep((currentProgress - 0.16) / 0.42);
    const bracketProgress = smoothstep((currentProgress - 0.08) / 0.36);
    const actionProgress = smoothstep((currentProgress - 0.36) / 0.4);
    const lineLift = mobileLayout.matches ? 18 : 24;
    const lineStartScale = mobileLayout.matches ? 0.9 : 0.86;
    const contentRise = mobileLayout.matches ? 38 : 72;
    const contentReturnProgress = smoothstep(currentProgress / 0.56);
    const contentOffset = (1 - contentReturnProgress) * contentRise;

    content.style.transform = `translateY(${-contentOffset.toFixed(2)}px)`;

    firstLine.style.opacity = lineOneProgress.toFixed(4);
    firstLine.style.transform = `translateY(${((1 - lineOneProgress) * lineLift).toFixed(2)}px) scale(${(lineStartScale + lineOneProgress * (1 - lineStartScale)).toFixed(4)})`;
    secondLine.style.opacity = lineTwoProgress.toFixed(4);
    secondLine.style.transform = `translateY(${((1 - lineTwoProgress) * lineLift).toFixed(2)}px) scale(${(lineStartScale + lineTwoProgress * (1 - lineStartScale)).toFixed(4)})`;
    action.style.opacity = actionProgress.toFixed(4);
    action.style.transform = `translateY(${((1 - actionProgress) * (mobileLayout.matches ? 14 : 18)).toFixed(2)}px) scale(${(0.94 + actionProgress * 0.06).toFixed(4)})`;

    brackets.forEach((bracket) => {
      bracket.style.opacity = bracketProgress.toFixed(4);
      bracket.style.transform = `translateY(calc(-50% + ${((1 - bracketProgress) * (mobileLayout.matches ? 12 : 18)).toFixed(2)}px)) scale(${(0.94 + bracketProgress * 0.06).toFixed(4)})`;
    });

    if (currentProgress !== targetProgress) {
      frameId = window.requestAnimationFrame(render);
    } else {
      frameId = 0;
    }
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

setupCtaContentScrollReveal();
