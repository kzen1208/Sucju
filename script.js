const ROSE_ICON_PATH = "img/rose.png";
const DOME_GALLERY_IMAGE_DIR = "img-mau";
const DOME_GALLERY_IMAGE_FILES = [
  "IMG_5974.PNG",
  "IMG_5976.PNG",
  "IMG_6401.PNG",
  "IMG_6402.PNG",
  "IMG_6404.PNG",
  "IMG_6405.PNG",
  "IMG_6540.PNG",
  "IMG_6541.PNG",
  "IMG_6544.PNG"
];
const DOME_GALLERY_IMAGES = DOME_GALLERY_IMAGE_FILES.map((fileName, index) => ({
  src: `${DOME_GALLERY_IMAGE_DIR}/${fileName}`,
  alt: `Khoảnh khắc ${String(index + 1).padStart(2, "0")}`,
}));
const DOME_GALLERY_DEFAULTS = {
  fit: 0.8,
  fitBasis: "auto",
  minRadius: 600,
  maxRadius: Number.POSITIVE_INFINITY,
  padFactor: 0.25,
  overlayBlurColor: "rgba(40, 0, 0, 0.9)",
  maxVerticalRotationDeg: 0,
  dragSensitivity: 20,
  segments: 34,
  dragDampening: 2,
  openedImageWidth: "250px",
  openedImageHeight: "350px",
  imageBorderRadius: "30px",
  openedImageBorderRadius: "30px",
  autoRotateSpeed: 0.045,
  grayscale: true,
};
const MUSIC_PLAYLIST = [
  // Update this list to change the playlist shown in the right-side player.
  {
    title: "I LOVE YOU (Always, In Every Way)",
    artist: "Bùi Công Nam, Binz",
    src: "playlist/I LOVE YOU (Always, In Every Way) - Bùi Công Nam Nữ x Binz - Prod. Machiot (special version).mp3",
  },
  {
    title: "Cảm Ơn Người Đã Thức Cùng Tôi",
    artist: "Original Soundtrack",
    src: "playlist/Cảm Ơn Người Đã Thức Cùng Tôi (Original Soundtrack).mp3",
  },
  {
    title: "Cậu - Em Lại Đi Đâu Đấy",
    artist: "Official Music Video",
    src: "playlist/Cáu - em lai di dau day- - Official Music Video.mp3",
  },
  {
    title: "Anh Bờ Vai",
    artist: "Vương Bình, Thanh Tân",
    src: "playlist/VƯƠNG BÌNH - Thanh Tân - 'ANH BỜ VAI' Ấn Bản KIM.mp3",
  },
];
const PERFORMANCE_MODE = detectPerformanceMode();
const STORY_PROGRESS_STATE = {
  isUnlocked: false,
  requestNavigation: null,
};
const ADMIN_TRACKING_STORAGE_KEY = "formylove-admin-viewer-id";
const ADMIN_LAST_ANSWER_STORAGE_KEY = "formylove-last-answer";

document.addEventListener("DOMContentLoaded", function () {
  setupReloadHeroReset();
  setupStoryProgression();
  setupMobileLetterGate();
  setupBlurText();
  setupRotatingCompliments();
  setupTrueFocus();
  setupAdminAnswerTracking();
  setupStaggeredMenu();
  setupCurvedLoops();
  if (!PERFORMANCE_MODE.mobileTouch) {
    setupFlowingMenu();
  }
  setupSplitReveals();
  setupTimelineMotion();
  runDeferred(setupDomeGallery, PERFORMANCE_MODE.mobileTouch ? 1200 : 600);
  runDeferred(setupHeartCursor, 900);
  setupMusic();
});

function detectPerformanceMode() {
  const params = new URLSearchParams(window.location.search);
  const forced = (params.get("performance") || "").toLowerCase();
  const mobileTouch =
    window.matchMedia("(max-width: 900px)").matches &&
    (window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(pointer: coarse)").matches);

  if (forced === "full") {
    return { mobileTouch: false, reason: "forced-full" };
  }

  if (forced === "lite") {
    return { mobileTouch: true, reason: "forced-lite" };
  }

  return { mobileTouch, reason: mobileTouch ? "mobile-touch" : "full" };
}

function runDeferred(task, timeout = 400) {
  if (typeof task !== "function") {
    return;
  }

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => task(), { timeout });
    return;
  }

  window.setTimeout(task, Math.max(0, Math.min(timeout, 1200)));
}

function setupReloadHeroReset() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const navigationEntries =
    typeof performance.getEntriesByType === "function"
      ? performance.getEntriesByType("navigation")
      : [];
  const legacyNavigationType = performance.navigation
    ? performance.navigation.type
    : -1;
  const didReload =
    navigationEntries[0]?.type === "reload" || legacyNavigationType === 1;

  if (!didReload) {
    return;
  }

  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  if (window.location.hash) {
    window.history.replaceState(null, "", cleanUrl);
  }

  const resetToHero = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  resetToHero();
  window.requestAnimationFrame(resetToHero);
  window.addEventListener("load", resetToHero, { once: true });
}

function setupCurvedLoops() {
  const loops = document.querySelectorAll(".curved-loop-jacket");

  loops.forEach((loop, index) => {
    initCurvedLoop(loop, index);
  });
}

function initCurvedLoop(loop, index) {
  if (loop.dataset.curvedLoopInit === "true") {
    return;
  }

  const marqueeText = loop.dataset.marqueeText || "";
  if (!marqueeText.trim()) {
    return;
  }

  const speed = Number.parseFloat(loop.dataset.speed || "2");
  const curveAmount = Number.parseFloat(loop.dataset.curveAmount || "180");
  const direction = loop.dataset.direction === "right" ? "right" : "left";
  const interactive = loop.dataset.interactive !== "false";
  const text = /(?:\s|\u00A0)$/.test(marqueeText)
    ? marqueeText.replace(/\s+$/, "") + "\u00A0"
    : marqueeText + "\u00A0";
  const pathId = `curved-loop-path-${index}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.classList.add("curved-loop-svg");
  svg.setAttribute("viewBox", "0 0 1440 220");
  svg.setAttribute("aria-hidden", "true");

  const measureText = document.createElementNS(svgNS, "text");
  measureText.classList.add("curved-loop-measure");
  measureText.setAttribute("xml:space", "preserve");
  measureText.textContent = text;

  const defs = document.createElementNS(svgNS, "defs");
  const path = document.createElementNS(svgNS, "path");
  path.id = pathId;
  path.setAttribute("d", buildCurvedLoopPath(curveAmount));
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "transparent");
  defs.appendChild(path);

  const textNode = document.createElementNS(svgNS, "text");
  textNode.classList.add("curved-loop-text");
  textNode.setAttribute("font-weight", "700");
  textNode.setAttribute("xml:space", "preserve");

  const textPath = document.createElementNS(svgNS, "textPath");
  textPath.setAttribute("href", `#${pathId}`);
  textPath.setAttribute("startOffset", "0px");
  textPath.setAttribute("xml:space", "preserve");
  textNode.appendChild(textPath);

  svg.appendChild(measureText);
  svg.appendChild(defs);
  svg.appendChild(textNode);
  loop.appendChild(svg);

  const state = {
    currentOffset: 0,
    dragActive: false,
    lastX: 0,
    velocity: 0,
    spacing: 0,
    direction,
    ready: false,
    visible: true,
  };

  loop.dataset.curvedLoopInit = "true";

  function wrapOffset(offset) {
    if (!state.spacing) {
      return offset;
    }

    let nextOffset = offset;
    while (nextOffset <= -state.spacing) {
      nextOffset += state.spacing;
    }
    while (nextOffset > 0) {
      nextOffset -= state.spacing;
    }

    return nextOffset;
  }

  function applyOffset() {
    textPath.setAttribute("startOffset", `${state.currentOffset}px`);
  }

  function updateLoopMetrics() {
    const measuredLength = measureText.getComputedTextLength();
    if (!Number.isFinite(measuredLength) || measuredLength <= 0) {
      return;
    }

    state.spacing = measuredLength;
    const repeatCount = Math.max(3, Math.ceil(2600 / measuredLength) + 2);
    textPath.textContent = Array(repeatCount).fill(text).join("");
    state.currentOffset = state.ready
      ? wrapOffset(state.currentOffset)
      : -state.spacing;
    applyOffset();
    state.ready = true;
  }

  function animateLoop() {
    if (state.ready && state.visible && !state.dragActive) {
      const delta = state.direction === "right" ? speed : -speed;
      state.currentOffset = wrapOffset(state.currentOffset + delta);
      applyOffset();
    }

    requestAnimationFrame(animateLoop);
  }

  if (interactive) {
    loop.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      if (!state.ready) {
        return;
      }

      state.dragActive = true;
      state.lastX = event.clientX;
      state.velocity = 0;
      loop.classList.add("is-dragging");

      if (typeof loop.setPointerCapture === "function") {
        try {
          loop.setPointerCapture(event.pointerId);
        } catch (error) {}
      }
    });

    loop.addEventListener("pointermove", (event) => {
      if (!state.dragActive || !state.ready) {
        return;
      }

      const deltaX = event.clientX - state.lastX;
      state.lastX = event.clientX;
      state.velocity = deltaX;
      state.currentOffset = wrapOffset(state.currentOffset + deltaX);
      applyOffset();
    });

    const endDrag = (event) => {
      if (!state.dragActive) {
        return;
      }

      state.dragActive = false;
      if (state.velocity !== 0) {
        state.direction = state.velocity > 0 ? "right" : "left";
      }
      loop.classList.remove("is-dragging");

      if (
        event &&
        typeof loop.releasePointerCapture === "function" &&
        typeof event.pointerId === "number"
      ) {
        try {
          loop.releasePointerCapture(event.pointerId);
        } catch (error) {}
      }
    };

    loop.addEventListener("pointerup", endDrag);
    loop.addEventListener("pointercancel", endDrag);
    loop.addEventListener("pointerleave", endDrag);
  }

  let resizeFrame = 0;
  window.addEventListener(
    "resize",
    () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(updateLoopMetrics);
    },
    { passive: true }
  );

  requestAnimationFrame(updateLoopMetrics);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateLoopMetrics).catch(() => {});
  }

  if (typeof IntersectionObserver !== "undefined") {
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          state.visible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );

    visibilityObserver.observe(loop);
  }

  animateLoop();
}

function buildCurvedLoopPath(curveAmount) {
  const baseline = 110;
  return `M-140,${baseline} Q720,${baseline + curveAmount} 1580,${baseline}`;
}

function setupTextTypes() {
  const textTypeElements = document.querySelectorAll("[data-texts]");
  textTypeElements.forEach((element) => {
    initTextType(element);
  });
}

function setupSplitReveals() {
  const splitElements = Array.from(
    document.querySelectorAll("[data-split-reveal]")
  );

  if (!splitElements.length) {
    return;
  }

  splitElements.forEach((element) => {
    prepareSplitReveal(element);
  });

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
    splitElements.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  const groupedElements = new Map();

  splitElements.forEach((element) => {
    const group = element.closest("[data-split-group]") || element;
    const currentGroup = groupedElements.get(group) || [];
    currentGroup.push(element);
    groupedElements.set(group, currentGroup);
  });

  groupedElements.forEach((elements, group) => {
    const threshold = Number.parseFloat(group.dataset.threshold || "0.18");
    const rootMargin = group.dataset.rootMargin || "0px 0px -80px 0px";
    const observer = new IntersectionObserver(
      (entries, activeObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          window.requestAnimationFrame(() => {
            elements.forEach((element) => {
              element.classList.add("is-visible");
            });
          });

          activeObserver.unobserve(entry.target);
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(group);
  });
}

function prepareSplitReveal(element) {
  if (!element || element.dataset.splitPrepared === "true") {
    return;
  }

  const splitMode = element.dataset.splitMode || "chars";
  const sourceText = (element.textContent || "").replace(/\s+/g, " ").trim();

  if (!sourceText) {
    return;
  }

  const duration = Number.parseFloat(element.dataset.duration || "900");
  const startDelay = Number.parseFloat(element.dataset.startDelay || "0");

  element.style.setProperty("--split-duration", `${duration}ms`);

  if (splitMode === "line") {
    element.textContent = sourceText;
    element.style.transitionDelay = `${startDelay}ms`;
    element.dataset.splitPrepared = "true";
    return;
  }

  const stagger = Number.parseFloat(element.dataset.stagger || "20");
  const fragment = document.createDocumentFragment();
  const words = sourceText.split(" ");
  let charIndex = 0;
  element.textContent = "";

  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "split-word";

    if (wordIndex === words.length - 1) {
      wordSpan.classList.add("split-word--last");
    }

    Array.from(word).forEach((character) => {
      const charSpan = document.createElement("span");
      charSpan.className = "split-char";
      charSpan.textContent = character;
      charSpan.style.transitionDelay = `${startDelay + charIndex * stagger}ms`;
      wordSpan.appendChild(charSpan);
      charIndex += 1;
    });

    fragment.appendChild(wordSpan);
  });

  element.appendChild(fragment);
  element.dataset.splitPrepared = "true";
}

function setupBlurText() {
  const blurElements = Array.from(document.querySelectorAll("[data-blur-text]"));

  if (!blurElements.length) {
    return;
  }

  blurElements.forEach((element) => {
    prepareBlurText(element);
  });

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
    blurElements.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  blurElements.forEach((element) => {
    const threshold = Number.parseFloat(
      element.dataset.blurThreshold || "0.1"
    );
    const rootMargin = element.dataset.blurRootMargin || "0px";
    const observer = new IntersectionObserver(
      (entries, activeObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          element.classList.add("is-visible");
          activeObserver.unobserve(entry.target);
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
  });
}

function prepareBlurText(element) {
  if (!element || element.dataset.blurPrepared === "true") {
    return;
  }

  const animateBy = element.dataset.blurAnimateBy || "words";
  const direction = element.dataset.blurDirection || "top";
  const delay = Number.parseFloat(element.dataset.blurDelay || "200");
  const sourceText = (element.textContent || "").trim();

  if (!sourceText) {
    return;
  }

  const segments =
    animateBy === "chars" ? Array.from(sourceText) : sourceText.split(/\s+/);
  const fragment = document.createDocumentFragment();

  element.classList.add("blur-text", `blur-text--${direction}`);
  element.setAttribute("aria-label", sourceText);
  element.textContent = "";

  segments.forEach((segment, index) => {
    const span = document.createElement("span");
    span.className = "blur-text__segment";
    span.textContent = segment === " " ? "\u00A0" : segment;
    span.style.animationDelay = `${index * delay}ms`;
    fragment.appendChild(span);
  });

  element.appendChild(fragment);
  element.dataset.blurPrepared = "true";
}

function setupRotatingCompliments() {
  const rotatingBlocks = Array.from(
    document.querySelectorAll("[data-rotating-compliment]")
  );

  if (!rotatingBlocks.length) {
    return;
  }

  rotatingBlocks.forEach((block) => {
    initRotatingCompliment(block);
  });
}

function initRotatingCompliment(block) {
  if (!block || block.dataset.rotatingInit === "true") {
    return;
  }

  const stage = block.querySelector(".rotating-compliment__stage");
  const texts = parseRotatingTexts(block.dataset.texts);

  if (!stage || !texts.length) {
    return;
  }

  const rotationInterval = Number.parseFloat(
    block.dataset.rotationInterval || "2200"
  );
  const staggerDuration = Number.parseFloat(
    block.dataset.staggerDuration || "35"
  );
  const staggerFrom = block.dataset.staggerFrom || "last";
  const maxCharacters = Math.max(
    ...texts.map((text) => splitRotatingTextGraphemes(text).length)
  );
  const wordElements = texts.map((text) =>
    createRotatingWordElement(text, staggerDuration, staggerFrom)
  );
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  stage.textContent = "";
  wordElements.forEach((word) => {
    stage.appendChild(word);
  });

  const updateStageSize = () => {
    let maxWidth = 0;
    let maxHeight = 0;

    wordElements.forEach((word) => {
      maxWidth = Math.max(maxWidth, word.offsetWidth);
      maxHeight = Math.max(maxHeight, word.offsetHeight);
    });

    if (maxWidth > 0) {
      stage.style.width = `${Math.ceil(maxWidth)}px`;
    }

    if (maxHeight > 0) {
      stage.style.height = `${Math.ceil(maxHeight)}px`;
    }
  };

  window.requestAnimationFrame(updateStageSize);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateStageSize).catch(() => {});
  }
  window.addEventListener("resize", updateStageSize);

  let currentIndex = 0;
  let rotationTimer = 0;

  wordElements[0].dataset.state = "current";
  stage.setAttribute("aria-label", texts[0]);
  block.dataset.rotatingInit = "true";

  if (prefersReducedMotion || texts.length === 1) {
    return;
  }

  const transitionBudget =
    650 + Math.max(0, maxCharacters - 1) * staggerDuration;

  const rotateTo = (nextIndex) => {
    if (nextIndex === currentIndex) {
      return;
    }

    const currentWord = wordElements[currentIndex];
    const nextWord = wordElements[nextIndex];

    currentWord.dataset.state = "exit";
    nextWord.dataset.state = "pre-enter";

    window.requestAnimationFrame(() => {
      nextWord.dataset.state = "current";
      stage.setAttribute("aria-label", texts[nextIndex]);
    });

    window.setTimeout(() => {
      currentWord.dataset.state = "idle";
    }, transitionBudget);

    currentIndex = nextIndex;
  };

  const startRotation = () => {
    rotationTimer = window.setInterval(() => {
      const nextIndex = (currentIndex + 1) % wordElements.length;
      rotateTo(nextIndex);
    }, rotationInterval);
  };

  startRotation();
}

function parseRotatingTexts(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean);
    }
  } catch (error) {}

  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createRotatingWordElement(text, staggerDuration, staggerFrom) {
  const word = document.createElement("span");
  const characters = splitRotatingTextGraphemes(text);
  const totalCharacters = characters.length;

  word.className = "rotating-compliment__word";
  word.dataset.state = "idle";

  characters.forEach((character, index) => {
    const element = document.createElement("span");
    const delay = getRotatingStaggerDelay(
      index,
      totalCharacters,
      staggerDuration,
      staggerFrom
    );

    element.className = "rotating-compliment__char";
    element.textContent = character === " " ? "\u00A0" : character;
    element.style.transitionDelay = `${delay}ms`;
    word.appendChild(element);
  });

  return word;
}

function splitRotatingTextGraphemes(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("vi", {
      granularity: "grapheme",
    });

    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }

  return Array.from(text);
}

function getRotatingStaggerDelay(index, totalCharacters, duration, from) {
  if (from === "first") {
    return index * duration;
  }

  if (from === "center") {
    const center = Math.floor(totalCharacters / 2);
    return Math.abs(center - index) * duration;
  }

  return (totalCharacters - 1 - index) * duration;
}

function setupTrueFocus() {
  const blocks = Array.from(document.querySelectorAll("[data-true-focus]"));

  if (!blocks.length) {
    return;
  }

  blocks.forEach((block) => {
    initTrueFocus(block);
  });
}

function initTrueFocus(block) {
  if (!block || block.dataset.trueFocusInit === "true") {
    return;
  }

  const words = Array.from(block.querySelectorAll(".answer-focus__word"));
  const frame = block.querySelector(".answer-focus__frame");
  const note = block.parentElement?.querySelector("[data-true-focus-note]");

  if (!words.length || !frame) {
    return;
  }

  const manualMode = block.dataset.manualMode === "true";
  const blurAmount = Number.parseFloat(block.dataset.blurAmount || "5");
  const animationDuration = Number.parseFloat(
    block.dataset.animationDuration || "0.5"
  );
  const pauseBetweenAnimations = Number.parseFloat(
    block.dataset.pauseBetweenAnimations || "1"
  );
  const borderColor =
    block.dataset.borderColor || "rgba(255, 255, 255, 0.96)";
  const glowColor = block.dataset.glowColor || "rgba(255, 226, 226, 0.34)";
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let currentIndex = 0;
  let rotationTimer = 0;
  const rotationSequence = words.flatMap((word, index) => {
    const weight = Number.parseInt(word.dataset.answerPriority || "1", 10);
    return Array.from({ length: Math.max(1, weight) }, () => index);
  });
  let rotationCursor = 0;

  block.style.setProperty("--answer-focus-duration", `${animationDuration}s`);
  block.style.setProperty("--answer-focus-border", borderColor);
  block.style.setProperty("--answer-focus-glow", glowColor);

  if (note) {
    note.dataset.defaultNote = note.textContent.trim();
  }

  const updateFrame = (activeWord = words[currentIndex]) => {
    if (!activeWord) {
      return;
    }

    const blockRect = block.getBoundingClientRect();
    const activeRect = activeWord.getBoundingClientRect();

    if (!blockRect.width || !activeRect.width) {
      return;
    }

    frame.style.transform = `translate(${Math.round(
      activeRect.left - blockRect.left
    )}px, ${Math.round(activeRect.top - blockRect.top)}px)`;
    frame.style.width = `${Math.ceil(activeRect.width)}px`;
    frame.style.height = `${Math.ceil(activeRect.height)}px`;
    frame.style.opacity = "1";
  };

  const applyState = (activeIndex) => {
    currentIndex = activeIndex;

    words.forEach((word, index) => {
      const isActive = index === activeIndex;

      word.classList.toggle("is-active", isActive);
      word.style.filter = isActive ? "blur(0px)" : `blur(${blurAmount}px)`;
      word.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (note) {
      const activeWord = words[activeIndex];
      note.textContent =
        activeWord?.dataset.focusNote || note.dataset.defaultNote || "";
    }

    updateFrame(words[activeIndex]);
  };

  const stopRotation = () => {
    if (!rotationTimer) {
      return;
    }

    window.clearInterval(rotationTimer);
    rotationTimer = 0;
  };

  const startRotation = () => {
    if (
      manualMode ||
      prefersReducedMotion ||
      words.length <= 1 ||
      rotationSequence.length <= 1
    ) {
      return;
    }

    stopRotation();
    rotationTimer = window.setInterval(() => {
      rotationCursor = (rotationCursor + 1) % rotationSequence.length;
      const nextIndex = rotationSequence[rotationCursor];
      applyState(nextIndex);
    }, (animationDuration + pauseBetweenAnimations) * 1000);
  };

  const handleInteraction = (index) => {
    stopRotation();
    const nextCursor = rotationSequence.indexOf(index);
    rotationCursor = nextCursor >= 0 ? nextCursor : 0;
    applyState(index);
  };

  words.forEach((word, index) => {
    word.addEventListener("pointerenter", () => {
      handleInteraction(index);
    });

    word.addEventListener("focus", () => {
      handleInteraction(index);
    });

    word.addEventListener("click", () => {
      handleInteraction(index);
    });
  });

  if (!manualMode && !prefersReducedMotion) {
    block.addEventListener("pointerleave", () => {
      startRotation();
    });

    block.addEventListener("focusout", (event) => {
      if (block.contains(event.relatedTarget)) {
        return;
      }

      startRotation();
    });
  }

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(() => {
      updateFrame(words[currentIndex]);
    });

    resizeObserver.observe(block);
    words.forEach((word) => {
      resizeObserver.observe(word);
    });
  }

  window.addEventListener("resize", () => {
    updateFrame(words[currentIndex]);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      updateFrame(words[currentIndex]);
    }).catch(() => {});
  }

  applyState(0);
  window.requestAnimationFrame(() => {
    updateFrame(words[currentIndex]);
  });
  startRotation();
  block.dataset.trueFocusInit = "true";
}

function setupAdminAnswerTracking() {
  const buttons = Array.from(
    document.querySelectorAll(".answer-focus__word[data-answer-value]")
  );
  const status = document.querySelector("[data-answer-status]");
  const adminPreviewMode = isAdminPreviewMode();

  if (!buttons.length) {
    return;
  }

  if (status) {
    status.hidden = !adminPreviewMode;
  }

  const lastAnswer = readLastTrackedAnswer();

  if (lastAnswer && status && adminPreviewMode) {
    updateAnswerStatus(status, lastAnswer.answer, {
      fallbackOnly: !getAdminWebhookUrl(),
      restored: true,
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const answer = button.dataset.answerValue || "";
      const source = button.dataset.answerSource || "letter-answer";

      if (!answer) {
        return;
      }

      const payload = buildAdminAnswerPayload(answer, {
        source,
        label: button.textContent.trim(),
      });

      persistTrackedAnswer(payload);
      if (adminPreviewMode) {
        updateAnswerStatus(status, answer);
      }

      const result = await sendAdminWebhookPayload(payload);

      if (!result.ok && adminPreviewMode) {
        console.warn("Admin webhook was not reached.", result.reason || result);
        updateAnswerStatus(status, answer, { fallbackOnly: true });
      }
    });
  });
}

function getAdminConfig() {
  const defaults = {
    webhookUrl: "",
    projectName: document.title || "Formylove",
    adminPreviewParam: "admin",
    adminPreviewValue: "1",
  };
  const runtimeConfig =
    window.FORMYLOVE_ADMIN_CONFIG &&
    typeof window.FORMYLOVE_ADMIN_CONFIG === "object"
      ? window.FORMYLOVE_ADMIN_CONFIG
      : {};

  return {
    ...defaults,
    ...runtimeConfig,
  };
}

function getAdminWebhookUrl() {
  const config = getAdminConfig();
  return typeof config.webhookUrl === "string" ? config.webhookUrl.trim() : "";
}

function isAdminPreviewMode() {
  const config = getAdminConfig();
  const params = new URLSearchParams(window.location.search);
  const previewParam =
    typeof config.adminPreviewParam === "string"
      ? config.adminPreviewParam.trim()
      : "admin";
  const previewValue =
    typeof config.adminPreviewValue === "string"
      ? config.adminPreviewValue.trim()
      : "1";

  if (!previewParam) {
    return false;
  }

  if (!params.has(previewParam)) {
    return false;
  }

  if (!previewValue) {
    return true;
  }

  return params.get(previewParam) === previewValue;
}

function buildAdminAnswerPayload(answer, metadata = {}) {
  const params = new URLSearchParams(window.location.search);
  const config = getAdminConfig();

  return {
    eventId: createAdminEventId(),
    eventType: "love_answer",
    projectName: config.projectName,
    answer,
    answerLabel: metadata.label || answer,
    source: metadata.source || "unknown",
    viewerToken:
      params.get("viewer") || params.get("guest") || params.get("id") || "",
    sessionViewerId: getOrCreateAdminViewerId(),
    answeredAt: new Date().toISOString(),
    pageUrl: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer || "",
    language: navigator.language || "",
    userAgent: navigator.userAgent || "",
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  };
}

async function sendAdminWebhookPayload(payload) {
  const webhookUrl = getAdminWebhookUrl();

  if (!webhookUrl) {
    return {
      ok: false,
      reason: "missing-webhook-url",
    };
  }

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const queued = navigator.sendBeacon(
      webhookUrl,
      new Blob([body], {
        type: "text/plain;charset=UTF-8",
      })
    );

    if (queued) {
      return {
        ok: true,
        transport: "beacon",
      };
    }
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body,
      mode: "cors",
      keepalive: true,
    });

    return {
      ok: true,
      transport: "fetch",
    };
  } catch (error) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
        body,
        mode: "no-cors",
        keepalive: true,
      });

      return {
        ok: true,
        transport: "fetch-no-cors",
      };
    } catch (fallbackError) {
      return {
        ok: false,
        reason: fallbackError?.message || error?.message || "webhook-failed",
      };
    }
  }
}

function updateAnswerStatus(statusElement, answer, options = {}) {
  if (!statusElement) {
    return;
  }

  const isAccept = answer === "accept";
  const restoredPrefix = options.restored ? "Lần trước em đã chọn: " : "";

  let text = isAccept
    ? `${restoredPrefix}Anh đã ghi lại lời đồng ý này rồi nha.`
    : `${restoredPrefix}Anh đã ghi lại câu trả lời này và vẫn tôn trọng cảm xúc của em.`;

  if (options.fallbackOnly) {
    text = isAccept
      ? "Anh đã ghi lại lời đồng ý này trên máy hiện tại. Chỉ cần nối webhook admin là sẽ báo cho anh ngay."
      : "Anh đã ghi lại câu trả lời này trên máy hiện tại. Chỉ cần nối webhook admin là sẽ báo cho anh ngay.";
    statusElement.dataset.statusTone = "error";
  } else {
    statusElement.dataset.statusTone = "success";
  }

  statusElement.textContent = text;
}

function getOrCreateAdminViewerId() {
  try {
    const saved = window.localStorage.getItem(ADMIN_TRACKING_STORAGE_KEY);

    if (saved) {
      return saved;
    }

    const nextId = createAdminEventId();
    window.localStorage.setItem(ADMIN_TRACKING_STORAGE_KEY, nextId);
    return nextId;
  } catch (error) {
    return createAdminEventId();
  }
}

function persistTrackedAnswer(payload) {
  try {
    window.localStorage.setItem(
      ADMIN_LAST_ANSWER_STORAGE_KEY,
      JSON.stringify({
        answer: payload.answer,
        answeredAt: payload.answeredAt,
        source: payload.source,
      })
    );
  } catch (error) {}
}

function readLastTrackedAnswer() {
  try {
    const raw = window.localStorage.getItem(ADMIN_LAST_ANSWER_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch (error) {
    return null;
  }
}

function createAdminEventId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `evt-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function setupFlowingMenu() {
  const menus = Array.from(document.querySelectorAll("[data-flow-menu]"));

  if (!menus.length) {
    return;
  }

  menus.forEach((menu) => {
    initFlowingMenu(menu);
  });
}

function initFlowingMenu(menu) {
  const items = Array.from(menu.querySelectorAll(".flow-menu-item"));

  if (!items.length) {
    return;
  }

  const supportsHover =
    window.matchMedia("(hover: hover)").matches &&
    window.matchMedia("(pointer: fine)").matches;

  const renderMarquees = () => {
    items.forEach((item) => {
      renderFlowingMenuMarquee(item);
    });
  };

  renderMarquees();
  window.addEventListener("resize", renderMarquees);

  items.forEach((item, index) => {
    const trigger = item.querySelector(".flow-menu-item__link");

    if (supportsHover) {
      item.addEventListener("pointerenter", (event) => {
        openFlowingMenuItem(item, event);
      });

      item.addEventListener("pointerleave", (event) => {
        closeFlowingMenuItem(item, event);
      });
    }

    if (trigger) {
      trigger.addEventListener("click", (event) => {
        if (supportsHover) {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        const isOpen = item.classList.contains("is-active");

        items.forEach((otherItem) => {
          closeFlowingMenuItem(otherItem);
        });

        if (!isOpen) {
          openFlowingMenuItem(item);
        }
      });
    }

    if (!supportsHover && index === 0) {
      openFlowingMenuItem(item);
    }
  });
}

function renderFlowingMenuMarquee(item) {
  const marqueeInner = item.querySelector(".flow-menu-marquee__inner");
  const text = item.dataset.flowText || "";
  const image = item.dataset.flowImage || "";
  const speed = Number.parseFloat(item.dataset.flowSpeed || "15");

  if (!marqueeInner || !text) {
    return;
  }

  marqueeInner.textContent = "";
  marqueeInner.appendChild(createFlowingMenuPart(text, image));

  const samplePart = marqueeInner.firstElementChild;
  const sampleWidth = samplePart
    ? samplePart.getBoundingClientRect().width
    : 280;
  const visibleWidth = item.getBoundingClientRect().width || window.innerWidth;
  const repetitions = Math.max(4, Math.ceil(visibleWidth / sampleWidth) + 2);

  marqueeInner.textContent = "";

  for (let index = 0; index < repetitions * 2; index += 1) {
    marqueeInner.appendChild(createFlowingMenuPart(text, image));
  }

  marqueeInner.style.setProperty("--flow-duration", `${speed}s`);
}

function createFlowingMenuPart(text, image) {
  const part = document.createElement("div");
  part.className = "flow-menu-part";

  const label = document.createElement("span");
  label.textContent = text;
  part.appendChild(label);

  if (image) {
    const media = document.createElement("div");
    media.className = "flow-menu-part__img";
    media.style.backgroundImage = `url("${image}")`;
    part.appendChild(media);
  }

  return part;
}

function openFlowingMenuItem(item, event) {
  const marquee = item.querySelector(".flow-menu-marquee");

  if (!marquee) {
    return;
  }

  const edge = event ? getFlowingMenuEdge(event, item) : "bottom";
  const startTransform =
    edge === "top" ? "translate3d(0, -101%, 0)" : "translate3d(0, 101%, 0)";

  item.classList.add("is-active");
  marquee.style.transition = "none";
  marquee.style.transform = startTransform;
  void marquee.offsetHeight;
  marquee.style.transition = "";
  marquee.style.transform = "translate3d(0, 0, 0)";
}

function closeFlowingMenuItem(item, event) {
  const marquee = item.querySelector(".flow-menu-marquee");

  if (!marquee) {
    return;
  }

  const edge = event ? getFlowingMenuEdge(event, item) : "bottom";
  const endTransform =
    edge === "top" ? "translate3d(0, -101%, 0)" : "translate3d(0, 101%, 0)";

  item.classList.remove("is-active");
  marquee.style.transform = endTransform;
}

function getFlowingMenuEdge(event, element) {
  const rect = element.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const topEdgeDistance = flowingMenuDistanceMetric(
    mouseX,
    mouseY,
    rect.width / 2,
    0
  );
  const bottomEdgeDistance = flowingMenuDistanceMetric(
    mouseX,
    mouseY,
    rect.width / 2,
    rect.height
  );

  return topEdgeDistance < bottomEdgeDistance ? "top" : "bottom";
}

function flowingMenuDistanceMetric(x1, y1, x2, y2) {
  const xDistance = x1 - x2;
  const yDistance = y1 - y2;

  return xDistance * xDistance + yDistance * yDistance;
}

function initTextType(element) {
  if (element.dataset.textTypeInit === "true") {
    return;
  }

  const texts = parseTextTypeTexts(element.dataset.texts);
  if (!texts.length) {
    return;
  }

  const typingSpeed = textTypeGetNumber(element, "typingSpeed", 50);
  const initialDelay = textTypeGetNumber(element, "initialDelay", 0);
  const pauseDuration = textTypeGetNumber(element, "pauseDuration", 2000);
  const deletingSpeed = textTypeGetNumber(element, "deletingSpeed", 30);
  const loop = textTypeGetBoolean(element, "loop", true);
  const showCursor = textTypeGetBoolean(element, "showCursor", true);
  const hideCursorWhileTyping = textTypeGetBoolean(
    element,
    "hideCursorWhileTyping",
    false
  );
  const startOnVisible = textTypeGetBoolean(
    element,
    "startOnVisible",
    false
  );
  const reverseMode = textTypeGetBoolean(element, "reverseMode", false);
  const cursorCharacter = element.dataset.cursorCharacter || "|";
  const cursorBlinkDuration = textTypeGetNumber(
    element,
    "cursorBlinkDuration",
    0.5
  );
  const variableSpeedEnabled =
    textTypeGetBoolean(element, "variableSpeedEnabled", false) ||
    textTypeGetBoolean(element, "variableSpeed", false);
  const variableSpeedMin = textTypeGetNumber(
    element,
    "variableSpeedMin",
    typingSpeed
  );
  const variableSpeedMax = textTypeGetNumber(
    element,
    "variableSpeedMax",
    typingSpeed
  );
  const textColors = parseTextTypeColors(element.dataset.textColors);

  const content = document.createElement("span");
  content.className = "text-type__content";

  let cursor = null;
  if (showCursor) {
    cursor = document.createElement("span");
    cursor.className = "text-type__cursor";
    cursor.textContent = cursorCharacter;
    cursor.style.setProperty(
      "--cursor-blink-duration",
      `${cursorBlinkDuration}s`
    );
  }

  element.replaceChildren(content);
  if (cursor) {
    element.appendChild(cursor);
  }

  element.dataset.textTypeInit = "true";

  const state = {
    displayedText: "",
    currentCharIndex: 0,
    isDeleting: false,
    currentTextIndex: 0,
    hasStarted: !startOnVisible,
    timeoutId: 0,
  };

  function updateCursorVisibility(currentText) {
    if (!cursor) {
      return;
    }

    const shouldHide =
      hideCursorWhileTyping &&
      (state.currentCharIndex < currentText.length || state.isDeleting);
    cursor.classList.toggle("text-type__cursor--hidden", shouldHide);
  }

  function getRandomSpeed() {
    if (!variableSpeedEnabled) {
      return typingSpeed;
    }

    return (
      Math.random() * (variableSpeedMax - variableSpeedMin) + variableSpeedMin
    );
  }

  function render() {
    const color = textColors.length
      ? textColors[state.currentTextIndex % textColors.length]
      : "inherit";
    content.textContent = state.displayedText;
    content.style.color = color;
  }

  function tick() {
    if (!state.hasStarted) {
      return;
    }

    const sourceText = texts[state.currentTextIndex] || "";
    const currentText = reverseMode
      ? sourceText.split("").reverse().join("")
      : sourceText;

    updateCursorVisibility(currentText);

    if (state.isDeleting) {
      if (state.displayedText === "") {
        state.isDeleting = false;

        if (state.currentTextIndex === texts.length - 1 && !loop) {
          updateCursorVisibility(currentText);
          return;
        }

        state.currentTextIndex = (state.currentTextIndex + 1) % texts.length;
        state.currentCharIndex = 0;
        state.timeoutId = window.setTimeout(tick, pauseDuration);
        return;
      }

      state.timeoutId = window.setTimeout(() => {
        state.displayedText = state.displayedText.slice(0, -1);
        state.currentCharIndex = Math.max(0, state.currentCharIndex - 1);
        render();
        tick();
      }, deletingSpeed);
      return;
    }

    if (state.currentCharIndex < currentText.length) {
      state.timeoutId = window.setTimeout(() => {
        state.displayedText += currentText[state.currentCharIndex];
        state.currentCharIndex += 1;
        render();
        tick();
      }, getRandomSpeed());
      return;
    }

    if (!loop && state.currentTextIndex === texts.length - 1) {
      updateCursorVisibility(currentText);
      return;
    }

    state.timeoutId = window.setTimeout(() => {
      state.isDeleting = true;
      tick();
    }, pauseDuration);
  }

  function startTyping() {
    if (state.hasStarted && !startOnVisible) {
      return;
    }

    state.hasStarted = true;
    const section = element.closest(".confession-section");
    if (section) {
      section.classList.add("show");
    }
    clearTimeout(state.timeoutId);
    state.timeoutId = window.setTimeout(tick, initialDelay);
  }

  if (startOnVisible) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startTyping();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
  } else {
    startTyping();
  }

  render();
}

function parseTextTypeTexts(rawValue) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
  } catch (error) {
    return rawValue
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function setupMobileLetterGate() {
  const confessionSection = document.getElementById("confession-section");
  const mobileQuery = window.matchMedia("(max-width: 768px)");

  if (!confessionSection) {
    return;
  }

  let userRevealedLetter = window.location.hash === "#confession-section";

  const applyGateState = () => {
    if (!mobileQuery.matches) {
      document.body.classList.remove("mobile-letter-locked");
      confessionSection.removeAttribute("aria-hidden");
      return;
    }

    if (userRevealedLetter || STORY_PROGRESS_STATE.isUnlocked) {
      document.body.classList.remove("mobile-letter-locked");
      confessionSection.removeAttribute("aria-hidden");
      return;
    }

    document.body.classList.add("mobile-letter-locked");
    confessionSection.setAttribute("aria-hidden", "true");
  };

  const revealLetter = () => {
    if (!mobileQuery.matches) {
      confessionSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    userRevealedLetter = true;
    document.body.classList.remove("mobile-letter-locked");
    confessionSection.removeAttribute("aria-hidden");
    confessionSection.classList.add("is-manually-revealed");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        confessionSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  document.addEventListener(
    "click",
    (event) => {
      const letterLink = event.target.closest('a[href="#confession-section"]');

      if (!letterLink || !mobileQuery.matches) {
        return;
      }

      if (userRevealedLetter) {
        return;
      }

      event.preventDefault();
      revealLetter();
    },
    true
  );

  mobileQuery.addEventListener("change", applyGateState);
  document.addEventListener("story-progress:unlocked", applyGateState);
  applyGateState();
}

function setupStoryProgression() {
  const heroSection = document.getElementById("hero-section");
  const narrativeSections = Array.from(
    document.querySelectorAll(".site-main > section:not(#hero-section)")
  );
  const directLinks = Array.from(
    document.querySelectorAll('a[href^="#"]:not([data-menu-link])')
  );
  const supportsIntersectionObserver =
    typeof IntersectionObserver !== "undefined";
  const hasDeepLink =
    Boolean(window.location.hash) && window.location.hash !== "#hero-section";
  let unlocked = false;
  let lastVisibleIndex = -1;
  let sectionObserver = null;

  if (!heroSection || !narrativeSections.length) {
    STORY_PROGRESS_STATE.isUnlocked = true;
    STORY_PROGRESS_STATE.requestNavigation = () => false;
    return;
  }

  narrativeSections.forEach((section) => {
    section.classList.add("story-section");
  });

  function markSectionVisible(section) {
    if (!(section instanceof Element)) {
      return;
    }

    section.classList.add("is-visible");
  }

  function getSectionIndex(section) {
    if (!(section instanceof Element)) {
      return -1;
    }

    return narrativeSections.indexOf(section);
  }

  function findOwningSection(target) {
    if (!(target instanceof Element)) {
      return null;
    }

    return target.closest(".story-section");
  }

  function activateStory() {
    if (unlocked) {
      return false;
    }

    unlocked = true;
    STORY_PROGRESS_STATE.isUnlocked = true;
    document.body.classList.remove("story-locked");
    document.body.classList.add("story-started");
    document.dispatchEvent(new CustomEvent("story-progress:unlocked"));
    return true;
  }

  function scrollToTarget(target, delay = 0) {
    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }, delay);
  }

  function observeNextSection() {
    if (!sectionObserver) {
      return;
    }

    sectionObserver.disconnect();
    const nextSection = narrativeSections[lastVisibleIndex + 1];

    if (!nextSection) {
      return;
    }

    sectionObserver.observe(nextSection);
  }

  function revealThroughIndex(index) {
    const clampedIndex = Math.min(index, narrativeSections.length - 1);

    if (!Number.isInteger(clampedIndex) || clampedIndex < 0) {
      return false;
    }

    let changed = false;

    for (let currentIndex = 0; currentIndex <= clampedIndex; currentIndex += 1) {
      const section = narrativeSections[currentIndex];

      if (!section.classList.contains("is-visible")) {
        changed = true;
      }

      markSectionVisible(section);
    }

    lastVisibleIndex = Math.max(lastVisibleIndex, clampedIndex);
    observeNextSection();
    return changed;
  }

  function unlockForNavigation(target, delay = 0) {
    const targetSection = findOwningSection(target);
    const targetIndex = getSectionIndex(targetSection);

    if (targetIndex < 0) {
      return false;
    }

    const storyJustUnlocked = activateStory();
    const revealChanged = revealThroughIndex(targetIndex);

    if (!storyJustUnlocked && !revealChanged) {
      return false;
    }

    scrollToTarget(target, delay);
    return true;
  }

  STORY_PROGRESS_STATE.requestNavigation = (target, options = {}) => {
    if (!(target instanceof Element) || target === heroSection) {
      return false;
    }

    const delay = Number.isFinite(options.delay) ? options.delay : 0;
    return unlockForNavigation(target, delay);
  };

  directLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#") || href === "#hero-section") {
        return;
      }

      const target = document.querySelector(href);

      if (!target) {
        return;
      }

      if (STORY_PROGRESS_STATE.requestNavigation(target)) {
        event.preventDefault();
      }
    });
  });

  STORY_PROGRESS_STATE.isUnlocked = false;
  document.body.classList.add("story-locked");

  if (supportsIntersectionObserver) {
    sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const sectionIndex = getSectionIndex(entry.target);

          if (sectionIndex !== lastVisibleIndex + 1) {
            return;
          }

          revealThroughIndex(sectionIndex);
        });
      },
      {
        threshold: 0.26,
        rootMargin: "0px 0px -12% 0px",
      }
    );
  }

  if (hasDeepLink) {
    const target = document.querySelector(window.location.hash);
    const targetSection = findOwningSection(target);
    const targetIndex = getSectionIndex(targetSection);

    activateStory();

    if (targetIndex >= 0) {
      revealThroughIndex(targetIndex);
    } else {
      revealThroughIndex(0);
    }
  }

  window.addEventListener("hashchange", () => {
    if (!window.location.hash || window.location.hash === "#hero-section") {
      return;
    }

    const target = document.querySelector(window.location.hash);

    if (!target) {
      return;
    }

    unlockForNavigation(target);
  });
}

function setupTimelineMotion() {
  const timelineSection = document.getElementById("timeline-section");
  const timelineRail = document.getElementById("journey-timeline");
  const timelineSteps = Array.from(
    document.querySelectorAll(".timeline-step")
  );
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!timelineSection || !timelineRail || !timelineSteps.length) {
    return;
  }

  timelineSteps.forEach((step, index) => {
    step.style.setProperty("--timeline-step-delay", `${index * 90}ms`);
  });

  if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
    timelineRail.classList.add("is-visible");
    timelineSteps.forEach((step) => {
      step.classList.add("is-visible");
    });
    return;
  }

  const railObserver = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        timelineRail.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -12% 0px",
    }
  );

  railObserver.observe(timelineSection);

  const stepObserver = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.26,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  timelineSteps.forEach((step) => {
    stepObserver.observe(step);
  });
}

function parseTextTypeColors(rawValue) {
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function textTypeGetBoolean(element, key, fallback) {
  const value = element.dataset[key];
  if (value === undefined) {
    return fallback;
  }

  return value !== "false";
}

function textTypeGetNumber(element, key, fallback) {
  const value = Number.parseFloat(element.dataset[key] || "");
  return Number.isFinite(value) ? value : fallback;
}

function setupDomeGallery() {
  const root = document.getElementById("dome-gallery");
  const uploadInput = document.getElementById("gallery-upload");
  const uploadStatus = document.getElementById("gallery-upload-status");
  const uploadLoaderText = document.getElementById(
    "gallery-upload-loader-text"
  );
  const folderPicker = document.getElementById("gallery-folder-picker");

  if (!root) {
    return;
  }

  const gallery = initDomeGallery(root);
  domeUpdateUploadStatus(uploadStatus, gallery.getImageCount());
  let folderOpenTimer = 0;

  function animateFolderPicker() {
    if (!folderPicker) {
      return;
    }

    window.clearTimeout(folderOpenTimer);
    folderPicker.classList.add("is-open");
    folderOpenTimer = window.setTimeout(() => {
      folderPicker.classList.remove("is-open");
    }, 1100);
  }

  async function importFiles(files) {
    const imageFiles = Array.from(files || []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (!imageFiles.length) {
      return;
    }

    if (uploadInput) {
      uploadInput.disabled = true;
    }
    root.classList.add("is-uploading");
    if (uploadStatus) {
      uploadStatus.textContent = `Đang thêm ${imageFiles.length} ảnh...`;
    }
    if (uploadLoaderText) {
      uploadLoaderText.textContent =
        imageFiles.length === 1
          ? "Đang xếp 1 ảnh vào thư mục..."
          : `Đang xếp ${imageFiles.length} ảnh vào thư mục...`;
    }

    try {
      const newImages = await domeFilesToImageItems(
        imageFiles,
        gallery.getImageCount()
      );
      gallery.addImages(newImages);
      domeUpdateUploadStatus(uploadStatus, gallery.getImageCount());
    } catch (error) {
      console.error("Khong the them anh vao dome gallery.", error);
      if (uploadStatus) {
        uploadStatus.textContent = "Chua them duoc anh, thu lai nhe.";
      }
    } finally {
      root.classList.remove("is-uploading");
      if (uploadInput) {
        uploadInput.disabled = false;
        uploadInput.value = "";
      }
    }
  }

  if (folderPicker && uploadInput) {
    folderPicker.addEventListener("click", () => {
      if (!uploadInput.disabled) {
        animateFolderPicker();
      }
    });

    folderPicker.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      if (!uploadInput.disabled) {
        animateFolderPicker();
        uploadInput.click();
      }
    });
  }

  if (uploadInput) {
    uploadInput.addEventListener("change", async (event) => {
      await importFiles(event.target.files);
    });
  }

  let dragDepth = 0;

  root.addEventListener("dragenter", (event) => {
    if (!domeHasImageFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    dragDepth += 1;
    root.classList.add("is-drag-over");
  });

  root.addEventListener("dragover", (event) => {
    if (!domeHasImageFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    root.classList.add("is-drag-over");
  });

  root.addEventListener("dragleave", (event) => {
    if (!domeHasImageFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);

    if (dragDepth === 0) {
      root.classList.remove("is-drag-over");
    }
  });

  root.addEventListener("drop", async (event) => {
    if (!domeHasImageFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    dragDepth = 0;
    root.classList.remove("is-drag-over");
    await importFiles(event.dataTransfer.files);
  });
}

function initDomeGallery(root) {
  if (root.dataset.domeGalleryInit === "true") {
    return root._domeGallery;
  }

  const options = {
    fit: domeGetNumber(root, "fit", DOME_GALLERY_DEFAULTS.fit),
    fitBasis: root.dataset.fitBasis || DOME_GALLERY_DEFAULTS.fitBasis,
    minRadius: domeGetNumber(
      root,
      "minRadius",
      DOME_GALLERY_DEFAULTS.minRadius
    ),
    maxRadius: domeGetNumber(
      root,
      "maxRadius",
      DOME_GALLERY_DEFAULTS.maxRadius
    ),
    padFactor: domeGetNumber(
      root,
      "padFactor",
      DOME_GALLERY_DEFAULTS.padFactor
    ),
    overlayBlurColor:
      root.dataset.overlayBlurColor ||
      DOME_GALLERY_DEFAULTS.overlayBlurColor,
    maxVerticalRotationDeg: domeGetNumber(
      root,
      "maxVerticalRotationDeg",
      DOME_GALLERY_DEFAULTS.maxVerticalRotationDeg
    ),
    dragSensitivity: domeGetNumber(
      root,
      "dragSensitivity",
      DOME_GALLERY_DEFAULTS.dragSensitivity
    ),
    segments: Math.max(
      10,
      Math.round(
        domeGetNumber(root, "segments", DOME_GALLERY_DEFAULTS.segments)
      )
    ),
    dragDampening: domeGetNumber(
      root,
      "dragDampening",
      DOME_GALLERY_DEFAULTS.dragDampening
    ),
    openedImageWidth:
      root.dataset.openedImageWidth ||
      DOME_GALLERY_DEFAULTS.openedImageWidth,
    openedImageHeight:
      root.dataset.openedImageHeight ||
      DOME_GALLERY_DEFAULTS.openedImageHeight,
    imageBorderRadius:
      root.dataset.imageBorderRadius ||
      DOME_GALLERY_DEFAULTS.imageBorderRadius,
    openedImageBorderRadius:
      root.dataset.openedImageBorderRadius ||
      DOME_GALLERY_DEFAULTS.openedImageBorderRadius,
    autoRotateSpeed: domeGetNumber(
      root,
      "autoRotateSpeed",
      DOME_GALLERY_DEFAULTS.autoRotateSpeed
    ),
    grayscale: root.dataset.grayscale !== "false",
  };

  root.dataset.domeGalleryInit = "true";
  root.style.setProperty("--segments-x", options.segments);
  root.style.setProperty("--segments-y", options.segments);
  root.style.setProperty("--overlay-blur-color", options.overlayBlurColor);
  root.style.setProperty("--tile-radius", options.imageBorderRadius);
  root.style.setProperty("--enlarge-radius", options.openedImageBorderRadius);
  root.style.setProperty("--opened-width", options.openedImageWidth);
  root.style.setProperty("--opened-height", options.openedImageHeight);
  root.style.setProperty(
    "--image-filter",
    options.grayscale ? "grayscale(1)" : "none"
  );

  const main = document.createElement("div");
  main.className = "dg-main";

  const stage = document.createElement("div");
  stage.className = "dg-stage";

  const sphere = document.createElement("div");
  sphere.className = "dg-sphere";
  stage.appendChild(sphere);

  const overlay = document.createElement("div");
  overlay.className = "dg-overlay";

  const overlayBlur = document.createElement("div");
  overlayBlur.className = "dg-overlay dg-overlay--blur";

  const edgeFadeTop = document.createElement("div");
  edgeFadeTop.className = "dg-edge-fade dg-edge-fade--top";

  const edgeFadeBottom = document.createElement("div");
  edgeFadeBottom.className = "dg-edge-fade dg-edge-fade--bottom";

  const viewer = document.createElement("div");
  viewer.className = "dg-viewer";

  const scrim = document.createElement("button");
  scrim.className = "dg-scrim";
  scrim.type = "button";
  scrim.setAttribute("aria-label", "Đóng ảnh");

  const viewerPanel = document.createElement("div");
  viewerPanel.className = "dg-viewer-panel";

  const closeButton = document.createElement("button");
  closeButton.className = "dg-close glass-surface-button glass-surface-button--icon";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Đóng ảnh");
  closeButton.innerHTML = "&times;";

  const viewerImage = document.createElement("img");
  viewerImage.draggable = false;
  viewerImage.alt = "";

  viewerPanel.appendChild(closeButton);
  viewerPanel.appendChild(viewerImage);
  viewer.appendChild(scrim);
  viewer.appendChild(viewerPanel);

  main.appendChild(stage);
  main.appendChild(overlay);
  main.appendChild(overlayBlur);
  main.appendChild(edgeFadeTop);
  main.appendChild(edgeFadeBottom);
  main.appendChild(viewer);
  root.appendChild(main);

  const state = {
    rotation: { x: 0, y: 0 },
    startRotation: { x: 0, y: 0 },
    startPosition: null,
    lastPointerPosition: null,
    activePointerId: null,
    dragging: false,
    moved: false,
    lastDragEndAt: 0,
    velocityX: 0,
    velocityY: 0,
    inertiaFrame: 0,
    viewerOpen: false,
    autoRotateResumeAt: 0,
    visible: true,
  };
  const currentImages = [];

  function hasRenderableItems() {
    return sphere.childElementCount > 0;
  }

  function renderItems(images) {
    sphere.replaceChildren();
    closeViewer();
    currentImages.length = 0;
    currentImages.push(...images);
    root.dataset.hasImages = currentImages.length ? "true" : "false";

    const items = currentImages.length
      ? domeBuildItems(currentImages, options.segments)
      : domeBuildPlaceholderItems(options.segments);

    items.forEach((itemData, index) => {
      const item = document.createElement("div");
      item.className = "dg-item";
      item.style.setProperty("--offset-x", itemData.x);
      item.style.setProperty("--offset-y", itemData.y);
      item.style.setProperty("--item-size-x", itemData.sizeX);
      item.style.setProperty("--item-size-y", itemData.sizeY);

      const button = document.createElement("button");
      button.className = "dg-item__image";
      button.type = "button";
      if (itemData.src) {
        button.setAttribute(
          "aria-label",
          itemData.alt || `Mở ảnh số ${index + 1}`
        );

        const image = document.createElement("img");
        image.src = itemData.src;
        image.alt = itemData.alt || `Ảnh số ${index + 1}`;
        image.loading = "lazy";
        image.decoding = "async";
        image.fetchPriority = "low";
        image.draggable = false;
        button.appendChild(image);
      } else {
        button.classList.add("is-placeholder");
        button.tabIndex = -1;
        button.setAttribute("aria-hidden", "true");

        const placeholder = document.createElement("span");
        placeholder.className = "dg-item__placeholder";
        placeholder.innerHTML = `
          <span class="dg-item__placeholder-top">
            <span class="dg-item__placeholder-dot"></span>
            <span class="dg-item__placeholder-pill"></span>
          </span>
          <span class="dg-item__placeholder-lines">
            <span class="dg-item__placeholder-line"></span>
            <span class="dg-item__placeholder-line dg-item__placeholder-line--short"></span>
            <span class="dg-item__placeholder-line dg-item__placeholder-line--tiny"></span>
          </span>
        `;
        button.appendChild(placeholder);
      }

      item.appendChild(button);
      sphere.appendChild(item);

      if (itemData.src) {
        button.addEventListener("click", () => {
          if (
            state.dragging ||
            state.moved ||
            performance.now() - state.lastDragEndAt < 120 ||
            state.viewerOpen
          ) {
            return;
          }

          openViewer(itemData);
        });
      }
    });
  }

  function applyTransform(xDeg, yDeg) {
    sphere.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
  }

  function updateRadius() {
    const rect = root.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const minDim = Math.min(width, height);
    const maxDim = Math.max(width, height);
    const aspect = width / height;
    let basis;

    switch (options.fitBasis) {
      case "min":
        basis = minDim;
        break;
      case "max":
        basis = maxDim;
        break;
      case "width":
        basis = width;
        break;
      case "height":
        basis = height;
        break;
      default:
        basis = aspect >= 1.3 ? width : minDim;
    }

    let radius = basis * options.fit;
    radius = Math.min(radius, height * 1.35);
    radius = domeClamp(radius, options.minRadius, options.maxRadius);
    const viewerPad = Math.max(10, Math.round(minDim * options.padFactor));

    root.style.setProperty("--radius", `${Math.round(radius)}px`);
    root.style.setProperty("--viewer-pad", `${viewerPad}px`);
    applyTransform(state.rotation.x, state.rotation.y);
  }

  function stopInertia() {
    if (state.inertiaFrame) {
      cancelAnimationFrame(state.inertiaFrame);
      state.inertiaFrame = 0;
    }
  }

  function startInertia(vx, vy) {
    const maxVelocity = 1.4;
    let velocityX = domeClamp(vx, -maxVelocity, maxVelocity) * 80;
    let velocityY = domeClamp(vy, -maxVelocity, maxVelocity) * 80;
    let frames = 0;
    const damp = domeClamp(options.dragDampening, 0, 1);
    const friction = 0.94 + 0.055 * damp;
    const stopThreshold = 0.015 - 0.01 * damp;
    const maxFrames = Math.round(90 + 270 * damp);

    const step = () => {
      velocityX *= friction;
      velocityY *= friction;

      if (
        Math.abs(velocityX) < stopThreshold &&
        Math.abs(velocityY) < stopThreshold
      ) {
        state.inertiaFrame = 0;
        return;
      }

      if (++frames > maxFrames) {
        state.inertiaFrame = 0;
        return;
      }

      const nextX = domeClamp(
        state.rotation.x - velocityY / 200,
        -options.maxVerticalRotationDeg,
        options.maxVerticalRotationDeg
      );
      const nextY = domeWrapAngleSigned(state.rotation.y + velocityX / 200);

      state.rotation = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);
      state.inertiaFrame = requestAnimationFrame(step);
    };

    stopInertia();
    state.inertiaFrame = requestAnimationFrame(step);
  }

  function openViewer(itemData) {
    state.viewerOpen = true;
    state.autoRotateResumeAt = performance.now() + 1600;
    viewerImage.src = itemData.src;
    viewerImage.alt = itemData.alt || "Ảnh kỷ niệm của em";
    root.setAttribute("data-viewer-open", "true");
    document.body.classList.add("dg-scroll-lock");
  }

  function closeViewer() {
    if (!state.viewerOpen) {
      return;
    }

    state.viewerOpen = false;
    state.autoRotateResumeAt = performance.now() + 1200;
    root.removeAttribute("data-viewer-open");
    document.body.classList.remove("dg-scroll-lock");

    setTimeout(() => {
      if (!state.viewerOpen) {
        viewerImage.removeAttribute("src");
        viewerImage.alt = "";
      }
    }, 360);
  }

  main.addEventListener("pointerdown", (event) => {
    if (state.viewerOpen || !hasRenderableItems()) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    stopInertia();
    state.autoRotateResumeAt = performance.now() + 1800;
    state.activePointerId = event.pointerId;
    state.dragging = true;
    state.moved = false;
    state.startRotation = { ...state.rotation };
    state.startPosition = { x: event.clientX, y: event.clientY };
    state.lastPointerPosition = { x: event.clientX, y: event.clientY };
    state.velocityX = 0;
    state.velocityY = 0;

    if (typeof main.setPointerCapture === "function") {
      try {
        main.setPointerCapture(event.pointerId);
      } catch (error) {}
    }
  });

  main.addEventListener("pointermove", (event) => {
    if (!state.dragging || event.pointerId !== state.activePointerId) {
      return;
    }

    const dxTotal = event.clientX - state.startPosition.x;
    const dyTotal = event.clientY - state.startPosition.y;

    if (!state.moved && dxTotal * dxTotal + dyTotal * dyTotal > 16) {
      state.moved = true;
    }

    const nextX = domeClamp(
      state.startRotation.x - dyTotal / options.dragSensitivity,
      -options.maxVerticalRotationDeg,
      options.maxVerticalRotationDeg
    );
    const nextY = domeWrapAngleSigned(
      state.startRotation.y + dxTotal / options.dragSensitivity
    );

    state.rotation = { x: nextX, y: nextY };
    applyTransform(nextX, nextY);

    state.velocityX = event.clientX - state.lastPointerPosition.x;
    state.velocityY = event.clientY - state.lastPointerPosition.y;
    state.lastPointerPosition = { x: event.clientX, y: event.clientY };
  });

  const endDrag = (event) => {
    if (!state.dragging) {
      return;
    }

    if (
      event &&
      event.type !== "pointerleave" &&
      event.pointerId !== state.activePointerId
    ) {
      return;
    }

    state.dragging = false;

    if (state.moved) {
      state.lastDragEndAt = performance.now();
    }

    if (
      Math.abs(state.velocityX) > 0.2 ||
      Math.abs(state.velocityY) > 0.2
    ) {
      startInertia(
        state.velocityX / options.dragSensitivity,
        state.velocityY / options.dragSensitivity
      );
    }

    if (
      event &&
      typeof main.releasePointerCapture === "function" &&
      typeof event.pointerId === "number"
    ) {
      try {
        main.releasePointerCapture(event.pointerId);
      } catch (error) {}
    }

    state.activePointerId = null;

    requestAnimationFrame(() => {
      state.moved = false;
    });
  };

  main.addEventListener("pointerup", endDrag);
  main.addEventListener("pointercancel", endDrag);
  main.addEventListener("pointerleave", endDrag);

  scrim.addEventListener("click", closeViewer);
  closeButton.addEventListener("click", closeViewer);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeViewer();
    }
  });

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(() => {
      updateRadius();
    });
    resizeObserver.observe(root);
  } else {
    window.addEventListener("resize", updateRadius, { passive: true });
  }

  if (typeof IntersectionObserver !== "undefined") {
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          state.visible = entry.isIntersecting;
        });
      },
      { threshold: 0.08 }
    );

    visibilityObserver.observe(root);
  }

  function animateAutoRotate() {
    if (
      hasRenderableItems() &&
      state.visible &&
      !document.hidden &&
      !state.dragging &&
      !state.viewerOpen &&
      !state.inertiaFrame &&
      performance.now() >= state.autoRotateResumeAt
    ) {
      state.rotation.y = domeWrapAngleSigned(
        state.rotation.y + options.autoRotateSpeed
      );
      applyTransform(state.rotation.x, state.rotation.y);
    }

    requestAnimationFrame(animateAutoRotate);
  }

  updateRadius();
  applyTransform(state.rotation.x, state.rotation.y);
  renderItems(DOME_GALLERY_IMAGES);
  animateAutoRotate();

  const api = {
    addImages(newImages) {
      if (!Array.isArray(newImages) || newImages.length === 0) {
        return currentImages.length;
      }

      renderItems([...currentImages, ...newImages]);
      return currentImages.length;
    },
    getImageCount() {
      return currentImages.length;
    },
  };

  root._domeGallery = api;
  return api;
}

function domeGetNumber(root, key, fallback) {
  const value = Number.parseFloat(root.dataset[key] || "");
  return Number.isFinite(value) ? value : fallback;
}

function domeClamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function domeWrapAngleSigned(deg) {
  const angle = (((deg + 180) % 360) + 360) % 360;
  return angle - 180;
}

function domeBuildItems(pool, segments) {
  const xColumns = Array.from({ length: segments }, (_, index) => -37 + index * 2);
  const evenRows = [-4, -2, 0, 2, 4];
  const oddRows = [-3, -1, 1, 3, 5];

  const coordinates = xColumns.flatMap((x, columnIndex) => {
    const rows = columnIndex % 2 === 0 ? evenRows : oddRows;
    return rows.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  if (pool.length === 0) {
    return coordinates.map((coordinate) => ({
      ...coordinate,
      src: "",
      alt: "",
    }));
  }

  const normalizedImages = pool.map((image) => {
    if (typeof image === "string") {
      return { src: image, alt: "" };
    }

    return { src: image.src || "", alt: image.alt || "" };
  });

  const usedImages = Array.from({ length: coordinates.length }, (_, index) => {
    return normalizedImages[index % normalizedImages.length];
  });

  for (let index = 1; index < usedImages.length; index++) {
    if (usedImages[index].src === usedImages[index - 1].src) {
      for (
        let swapIndex = index + 1;
        swapIndex < usedImages.length;
        swapIndex++
      ) {
        if (usedImages[swapIndex].src !== usedImages[index].src) {
          const temp = usedImages[index];
          usedImages[index] = usedImages[swapIndex];
          usedImages[swapIndex] = temp;
          break;
        }
      }
    }
  }

  return coordinates.map((coordinate, index) => ({
    ...coordinate,
    src: usedImages[index].src,
    alt: usedImages[index].alt,
  }));
}

function domeBuildPlaceholderItems(segments) {
  return domeBuildItems([], segments).filter(
    (_, index) => index % 4 === 0 || index % 11 === 0
  );
}

async function domeFilesToImageItems(files, startIndex = 0) {
  const loadedImages = await Promise.all(
    files.map(async (file, index) => {
      const src = await domeReadFileAsDataUrl(file);
      if (!src) {
        return null;
      }

      return {
        src,
        alt: domeFormatUploadAlt(file.name, startIndex + index + 1),
      };
    })
  );

  return loadedImages.filter(Boolean);
}

function domeReadFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function domeFormatUploadAlt(fileName, fallbackIndex) {
  const label = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();

  return label || `Ảnh tải lên ${fallbackIndex}`;
}

function domeUpdateUploadStatus(statusElement, count) {
  if (!statusElement) {
    return;
  }

  statusElement.textContent =
    count > 0 ? `Đã thêm ${count} ảnh` : "Chưa có ảnh";
}

function domeHasImageFiles(dataTransfer) {
  if (!dataTransfer) {
    return false;
  }

  if (
    Array.from(dataTransfer.types || []).includes("Files") &&
    (!dataTransfer.items || dataTransfer.items.length === 0)
  ) {
    return true;
  }

  if (dataTransfer.files && dataTransfer.files.length > 0) {
    return Array.from(dataTransfer.files).some((file) =>
      file.type.startsWith("image/")
    );
  }

  return Array.from(dataTransfer.items || []).some(
    (item) => item.kind === "file" && item.type.startsWith("image/")
  );
}

function setupHeartCursor() {
  const container = document.getElementById("heart-cursor-container");
  const supportsHover =
    window.matchMedia("(hover: hover)").matches &&
    window.matchMedia("(pointer: fine)").matches;

  if (!container || !supportsHover) {
    return;
  }

  let lastTime = 0;

  document.addEventListener("mousemove", (e) => {
    if (document.hidden) {
      return;
    }

    const now = Date.now();
    if (now - lastTime < 90) return;
    lastTime = now;

    for (let i = 0; i < 1; i++) {
      const heart = document.createElement("div");
      heart.className = "cursor-heart";
      heart.innerHTML = createRoseIconMarkup("cursor-heart-icon");
      heart.style.left = e.clientX + "px";
      heart.style.top = e.clientY + "px";

      const dx = (Math.random() - 0.5) * 60;
      const dy = -Math.random() * 40 - 20;
      const rotation = (Math.random() - 0.5) * 360;

      heart.style.setProperty("--dx", dx + "px");
      heart.style.setProperty("--dy", dy + "px");
      heart.style.setProperty("--rotation", rotation + "deg");

      container.appendChild(heart);

      setTimeout(() => heart.remove(), 800);
    }
  });
}

function setupMusic() {
  const music = document.getElementById("background-music");
  const card = document.getElementById("music-player-card");
  const mobileToggleButton = document.getElementById("music-mobile-toggle");
  const playerPanel = document.getElementById("music-player-panel");
  const coverButton = document.getElementById("music-cover-button");
  const playButton = document.getElementById("music-play");
  const prevButton = document.getElementById("music-prev");
  const nextButton = document.getElementById("music-next");
  const shuffleButton = document.getElementById("music-shuffle");
  const playlistToggleButton = document.getElementById("music-playlist-toggle");
  const muteButton = document.getElementById("music-mute");
  const repeatButton = document.getElementById("music-repeat");
  const seekInput = document.getElementById("music-seek");
  const trackName = document.getElementById("music-track-name");
  const trackArtist = document.getElementById("music-track-artist");
  const trackCount = document.getElementById("music-track-count");
  const currentTime = document.getElementById("music-current-time");
  const durationTime = document.getElementById("music-duration");
  const playlistPanel = document.getElementById("music-playlist-panel");
  const playlistList = document.getElementById("music-playlist");
  const playlistSize = document.getElementById("music-playlist-size");

  if (
    !music ||
    !card ||
    !mobileToggleButton ||
    !playerPanel ||
    !coverButton ||
    !playButton ||
    !prevButton ||
    !nextButton ||
    !shuffleButton ||
    !playlistToggleButton ||
    !muteButton ||
    !repeatButton ||
    !seekInput ||
    !trackName ||
    !trackArtist ||
    !trackCount ||
    !currentTime ||
    !durationTime ||
    !playlistPanel ||
    !playlistList ||
    !playlistSize
  ) {
    return;
  }

  const tracks = MUSIC_PLAYLIST.filter((track) => track && track.src).map(
    (track, index) => ({
      title: track.title || `Bài hát ${index + 1}`,
      artist: track.artist || "Playlist cho em",
      src: track.src,
    })
  );

  if (!tracks.length) {
    card.hidden = true;
    return;
  }

  const state = {
    index: 0,
    shuffle: false,
    repeat: true,
    playlistOpen: false,
    collapsed: false,
  };
  const mobileQuery = window.matchMedia("(max-width: 768px)");

  music.volume = 0.3;
  music.loop = false;
  music.preload = "metadata";

  function formatTrackCount(count) {
    return `${count} bài`;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${mins}:${secs}`;
  }

  function setPlaylistOpen(isOpen) {
    state.playlistOpen = isOpen;
    card.classList.toggle("is-playlist-open", isOpen);
    playlistPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
    playlistToggleButton.setAttribute(
      "aria-expanded",
      isOpen ? "true" : "false"
    );
  }

  function setPlayerCollapsed(isCollapsed) {
    const nextCollapsed = Boolean(isCollapsed);
    state.collapsed = nextCollapsed;

    if (nextCollapsed) {
      setPlaylistOpen(false);
    }

    card.classList.toggle("is-collapsed", nextCollapsed);
    playerPanel.setAttribute("aria-hidden", nextCollapsed ? "true" : "false");
    mobileToggleButton.setAttribute(
      "aria-expanded",
      nextCollapsed ? "false" : "true"
    );
    mobileToggleButton.setAttribute(
      "aria-label",
      nextCollapsed ? "Mở trình phát nhạc" : "Thu gọn trình phát nhạc"
    );
  }

  function updateTrackMeta() {
    const activeTrack = tracks[state.index];
    trackName.textContent = activeTrack.title;
    trackArtist.textContent = activeTrack.artist;
    trackName.title = activeTrack.title;
    trackArtist.title = activeTrack.artist;
    trackCount.textContent = `Playlist ${state.index + 1} / ${tracks.length}`;
    playlistSize.textContent = formatTrackCount(tracks.length);
  }

  function updateTimeline() {
    const duration = Number.isFinite(music.duration) ? music.duration : 0;
    const elapsed = Number.isFinite(music.currentTime) ? music.currentTime : 0;

    currentTime.textContent = formatTime(elapsed);
    durationTime.textContent = formatTime(duration);
    seekInput.value = duration > 0 ? ((elapsed / duration) * 100).toFixed(2) : "0";
  }

  function updatePlayState() {
    const isPlaying = !music.paused;
    const playIcon = isPlaying ? "ri-pause-fill" : "ri-play-fill";
    playButton.innerHTML = `<i class="${playIcon}" aria-hidden="true"></i>`;
    playButton.setAttribute("aria-label", isPlaying ? "Tạm dừng nhạc" : "Phát nhạc");
    coverButton.setAttribute("aria-label", isPlaying ? "Tạm dừng nhạc" : "Phát nhạc");
    card.classList.toggle("is-playing", isPlaying);
  }

  function updateOptionButtons() {
    shuffleButton.classList.toggle("is-active", state.shuffle);
    shuffleButton.setAttribute("aria-pressed", state.shuffle ? "true" : "false");

    repeatButton.classList.toggle("is-active", state.repeat);
    repeatButton.setAttribute("aria-pressed", state.repeat ? "true" : "false");

    muteButton.classList.toggle("is-active", music.muted);
    muteButton.setAttribute("aria-pressed", music.muted ? "true" : "false");
    muteButton.setAttribute("aria-label", music.muted ? "Bật tiếng" : "Tắt tiếng");
    muteButton.innerHTML = music.muted
      ? '<i class="ri-volume-mute-fill" aria-hidden="true"></i>'
      : '<i class="ri-volume-up-fill" aria-hidden="true"></i>';
  }

  function renderPlaylist() {
    playlistList.replaceChildren();

    tracks.forEach((track, index) => {
      const item = document.createElement("li");
      item.className = "music-playlist-item";

      if (index === state.index) {
        item.classList.add("is-active");
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "music-playlist-button";
      button.setAttribute("aria-label", `Phát ${track.title}`);
      button.innerHTML = `
        <span class="music-playlist-title">${track.title}</span>
        <span class="music-playlist-artist">${track.artist}</span>
      `;

      button.addEventListener("click", () => {
        loadTrack(index, { autoplay: true });
        setPlaylistOpen(false);
      });

      item.appendChild(button);
      playlistList.appendChild(item);
    });
  }

  function safePlay() {
    music.play().catch((error) => {
      console.log("Music play failed:", error);
      updatePlayState();
    });
  }

  function loadTrack(index, options = {}) {
    const { autoplay = false } = options;
    state.index = (index + tracks.length) % tracks.length;
    music.src = tracks[state.index].src;
    music.load();
    updateTrackMeta();
    renderPlaylist();
    updateTimeline();

    if (autoplay) {
      safePlay();
    } else {
      updatePlayState();
    }
  }

  function getAdjacentTrackIndex(direction) {
    if (!tracks.length) {
      return null;
    }

    if (state.shuffle && tracks.length > 1) {
      let randomIndex = state.index;
      while (randomIndex === state.index) {
        randomIndex = Math.floor(Math.random() * tracks.length);
      }
      return randomIndex;
    }

    const nextIndex = state.index + direction;

    if (nextIndex < 0) {
      return state.repeat ? tracks.length - 1 : null;
    }

    if (nextIndex >= tracks.length) {
      return state.repeat ? 0 : null;
    }

    return nextIndex;
  }

  function goToPreviousTrack() {
    if (music.currentTime > 4) {
      music.currentTime = 0;
      updateTimeline();
      return;
    }

    const previousIndex = getAdjacentTrackIndex(-1);
    if (previousIndex === null) {
      music.currentTime = 0;
      updateTimeline();
      return;
    }

    loadTrack(previousIndex, { autoplay: !music.paused });
  }

  function goToNextTrack() {
    const nextIndex = getAdjacentTrackIndex(1);

    if (nextIndex === null) {
      music.pause();
      music.currentTime = 0;
      updateTimeline();
      return;
    }

    loadTrack(nextIndex, { autoplay: true });
  }

  function togglePlayback() {
    if (music.paused) {
      safePlay();
      return;
    }

    music.pause();
  }

  coverButton.addEventListener("click", togglePlayback);
  playButton.addEventListener("click", togglePlayback);
  prevButton.addEventListener("click", goToPreviousTrack);
  nextButton.addEventListener("click", goToNextTrack);

  shuffleButton.addEventListener("click", () => {
    state.shuffle = !state.shuffle;
    updateOptionButtons();
  });

  repeatButton.addEventListener("click", () => {
    state.repeat = !state.repeat;
    updateOptionButtons();
  });

  muteButton.addEventListener("click", () => {
    music.muted = !music.muted;
    updateOptionButtons();
  });

  playlistToggleButton.addEventListener("click", () => {
    setPlaylistOpen(!state.playlistOpen);
  });

  mobileToggleButton.addEventListener("click", () => {
    setPlayerCollapsed(!state.collapsed);
  });

  seekInput.addEventListener("input", () => {
    if (!Number.isFinite(music.duration) || music.duration <= 0) {
      return;
    }

    const nextTime = (Number.parseFloat(seekInput.value) / 100) * music.duration;
    music.currentTime = nextTime;
    updateTimeline();
  });

  music.addEventListener("loadedmetadata", updateTimeline);
  music.addEventListener("durationchange", updateTimeline);
  music.addEventListener("timeupdate", updateTimeline);
  music.addEventListener("play", updatePlayState);
  music.addEventListener("pause", updatePlayState);
  music.addEventListener("volumechange", updateOptionButtons);
  music.addEventListener("ended", goToNextTrack);

  document.addEventListener("click", (event) => {
    if (state.playlistOpen && !card.contains(event.target)) {
      setPlaylistOpen(false);
    }

    if (mobileQuery.matches && !state.collapsed && !card.contains(event.target)) {
      setPlayerCollapsed(true);
    }
  });

  const handleMobileQueryChange = (event) => {
    if (event.matches && !state.collapsed) {
      setPlayerCollapsed(true);
      return;
    }

    setPlayerCollapsed(state.collapsed);
  };

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleMobileQueryChange);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(handleMobileQueryChange);
  }

  document.addEventListener(
    "click",
    () => {
      if (music.paused) {
        safePlay();
      }
    },
    { once: true }
  );

  loadTrack(0);
  updateOptionButtons();
  state.collapsed = mobileQuery.matches;
  setPlayerCollapsed(state.collapsed);
}

function setupStaggeredMenu() {
  const wrapper = document.getElementById("staggered-menu");
  const layer = document.getElementById("staggered-menu-layer");
  const toggle = document.getElementById("sm-toggle");
  const panel = document.getElementById("staggered-menu-panel");
  const backdrop = document.getElementById("sm-backdrop");

  if (!wrapper || !layer || !toggle || !panel || !backdrop) {
    return;
  }

  const menuLinks = layer.querySelectorAll("[data-menu-link]");

  function setMenuState(isOpen) {
    wrapper.classList.toggle("is-open", isOpen);
    layer.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    wrapper.toggleAttribute("data-open", isOpen);
    layer.toggleAttribute("data-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  }

  function toggleMenu() {
    setMenuState(!wrapper.classList.contains("is-open"));
  }

  function closeMenu() {
    setMenuState(false);
  }

  toggle.addEventListener("click", toggleMenu);
  backdrop.addEventListener("click", closeMenu);

  menuLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");

      closeMenu();

      if (!targetId || !targetId.startsWith("#")) {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      e.preventDefault();
      if (
        STORY_PROGRESS_STATE.requestNavigation &&
        STORY_PROGRESS_STATE.requestNavigation(target, { delay: 180 })
      ) {
        return;
      }

      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 180);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && wrapper.classList.contains("is-open")) {
      closeMenu();
    }
  });
}

function createRoseIconMarkup(className = "") {
  const classAttr = className ? ` class="${className}"` : "";
  return `<img src="${ROSE_ICON_PATH}" alt=""${classAttr} draggable="false">`;
}
