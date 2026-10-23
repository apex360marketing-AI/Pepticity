/**
 * ScrollKit — zero-dependency cinematic scroll primitives.
 * Smooth scroll, reveal-on-scroll, parallax, and pinned step sections,
 * driven entirely by data attributes. Works on a static page or inside
 * a framework component (call ScrollKit.init(rootEl) in a mount effect).
 *
 * Attribute reference
 * --------------------
 * <body data-scroll-smooth>              Opt the whole page into eased scroll.
 *
 * [data-reveal]                          Fade/rise in once, first time it enters view.
 * [data-reveal-delay="120"]              Delay in ms after entering view (default 0).
 * [data-reveal-style="rise|scale|fade"]  Entry style (default "rise").
 *
 * [data-parallax="0.3"]                  Moves at this fraction of scroll speed.
 *                                        Positive = same direction, slower than scroll.
 * [data-parallax-axis="x|y"]             Axis to move on (default "y").
 *
 * [data-pin]                             Section pins while its steps crossfade.
 * [data-pin-steps=".step"]               Selector (relative to the section) for the
 *                                        step elements that crossfade in sequence.
 *
 * All motion is transform/opacity only (no layout thrash) and everything
 * respects prefers-reduced-motion automatically — see prefersReducedMotion().
 */

const cleanupByRoot = new WeakMap();

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function track(root, fn) {
  if (!cleanupByRoot.has(root)) cleanupByRoot.set(root, []);
  cleanupByRoot.get(root).push(fn);
}

// ---------------------------------------------------------------------------
// 1. Smooth scroll
// ---------------------------------------------------------------------------
function initSmoothScroll(root) {
  const body = document.body;
  if (!body.hasAttribute("data-scroll-smooth") || prefersReducedMotion()) return;
  if (body.classList.contains("sk-smooth-active")) return; // already running

  const wrapper = document.createElement("div");
  wrapper.className = "sk-smooth-wrapper";
  while (body.firstChild) wrapper.appendChild(body.firstChild);
  body.appendChild(wrapper);
  body.classList.add("sk-smooth-active");

  let current = 0;
  let rafId = null;
  const ease = 0.085;

  function setHeight() {
    body.style.height = `${wrapper.scrollHeight}px`;
  }
  setHeight();
  const resizeObserver = new ResizeObserver(setHeight);
  resizeObserver.observe(wrapper);

  function loop() {
    const target = window.scrollY;
    current += (target - current) * ease;
    if (Math.abs(target - current) < 0.05) current = target;
    wrapper.style.transform = `translate3d(0, ${-current}px, 0)`;
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  track(root, () => {
    cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    body.classList.remove("sk-smooth-active");
    body.style.height = "";
    while (wrapper.firstChild) body.appendChild(wrapper.firstChild);
    wrapper.remove();
  });
}

// ---------------------------------------------------------------------------
// 2. Reveal on scroll
// ---------------------------------------------------------------------------
function initReveal(root) {
  const els = root.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  if (prefersReducedMotion()) {
    els.forEach((el) => el.classList.add("sk-reveal-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.getAttribute("data-reveal-delay")) || 0;
        const timeoutId = setTimeout(() => {
          entry.target.classList.add("sk-reveal-visible");
        }, delay);
        track(root, () => clearTimeout(timeoutId));
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  els.forEach((el) => observer.observe(el));
  track(root, () => observer.disconnect());
}

// ---------------------------------------------------------------------------
// 3. Parallax
// ---------------------------------------------------------------------------
function initParallax(root) {
  const els = Array.from(root.querySelectorAll("[data-parallax]"));
  if (!els.length || prefersReducedMotion()) return;

  let rafId = null;
  function update() {
    const vh = window.innerHeight;
    els.forEach((el) => {
      const factor = parseFloat(el.getAttribute("data-parallax")) || 0.2;
      const axis = el.getAttribute("data-parallax-axis") || "y";
      const rect = el.getBoundingClientRect();
      const centerOffset = rect.top + rect.height / 2 - vh / 2;
      const offset = -centerOffset * factor;
      el.style.transform =
        axis === "x" ? `translate3d(${offset}px,0,0)` : `translate3d(0,${offset}px,0)`;
    });
    rafId = requestAnimationFrame(update);
  }
  rafId = requestAnimationFrame(update);
  track(root, () => cancelAnimationFrame(rafId));
}

// ---------------------------------------------------------------------------
// 4. Pinned step sections
// ---------------------------------------------------------------------------
function initPin(root) {
  const sections = root.querySelectorAll("[data-pin]");
  if (!sections.length) return;

  sections.forEach((section) => {
    const stepsSelector = section.getAttribute("data-pin-steps");
    const steps = stepsSelector ? Array.from(section.querySelectorAll(stepsSelector)) : [];
    const count = Math.max(steps.length, 1);

    section.style.minHeight = `${count * 100}vh`;

    const inner = document.createElement("div");
    inner.className = "sk-pin-inner";
    while (section.firstChild) inner.appendChild(section.firstChild);
    section.appendChild(inner);

    steps.forEach((step) => step.classList.add("sk-pin-step"));
    if (steps[0]) steps[0].classList.add("sk-step-active");

    let rafId = null;
    function update() {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      const activeIndex = Math.min(Math.floor(progress * count), count - 1);
      steps.forEach((step, i) => step.classList.toggle("sk-step-active", i === activeIndex));
      rafId = requestAnimationFrame(update);
    }
    rafId = requestAnimationFrame(update);
    track(root, () => cancelAnimationFrame(rafId));
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
const ScrollKit = {
  init(root = document) {
    initSmoothScroll(root);
    initReveal(root);
    initParallax(root);
    initPin(root);
  },
  destroy(root = document) {
    const fns = cleanupByRoot.get(root) || [];
    fns.forEach((fn) => fn());
    cleanupByRoot.delete(root);
  },
};

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ScrollKit.init(document));
  } else {
    ScrollKit.init(document);
  }
}

export default ScrollKit;
