/**
 * Phase 6.3 — LCP candidate verification utility.
 *
 * The hero's `<h1 id="hero-title">` MUST be the Largest Contentful Paint
 * candidate. This module provides:
 *
 * 1. `assertH1IsLcpCandidate()` — checks whether an h1 element meets
 *    all the required conditions at first paint (text node, no hidden
 *    styles, no aria-hidden on ancestors).
 *
 * 2. `createPerformanceObserverLcpCheck()` — sets up a PerformanceObserver
 *    that captures the LCP entry for manual/Playwright verification.
 *
 * Design contract: spec § "Semantic SSR shell", scenario "hero is
 * rendered server-side".
 */

/**
 * Result of an LCP candidate assertion against a DOM element.
 * `pass` is true when the element satisfies ALL LCP candidate conditions.
 * `failures` lists specific reasons why the element might NOT become
 * the LCP candidate (empty when `pass` is true).
 */
export interface LcpCandidateResult {
  pass: boolean;
  failures: string[];
  element: {
    tagName: string;
    id: string | null;
    textContent: string;
  } | null;
}

/**
 * Check whether a DOM element meets the conditions to be an LCP candidate.
 *
 * Conditions (from spec § "Semantic SSR shell"):
 * - Element is not aria-hidden (and no ancestor is aria-hidden)
 * - Element has no display:none, visibility:hidden, or opacity:0
 * - Element is a text-containing node (not empty)
 *
 * @param element — The DOM element to check (typically the h1).
 * @returns LcpCandidateResult with pass/fail and detailed failures.
 */
export function assertH1IsLcpCandidate(
  element: HTMLElement,
): LcpCandidateResult {
  const failures: string[] = [];
  const tagName = element.tagName.toLowerCase();
  const id = element.getAttribute("id");

  // ── Condition 1: Must be an h1 ──────────────────────────────────
  if (tagName !== "h1") {
    failures.push(`Element is <${tagName}>, not <h1>`);
  }

  // ── Condition 2: No aria-hidden on self or ancestors ─────────────
  let el: HTMLElement | null = element;
  while (el) {
    if (el.getAttribute("aria-hidden") === "true") {
      failures.push(
        `Element or ancestor <${el.tagName.toLowerCase()}> has aria-hidden="true"`,
      );
      break;
    }
    el = el.parentElement;
  }

  // ── Conditions 3–5: Layout-affecting computed styles ────────────
  // Cache getComputedStyle once — each call triggers a layout reflow.
  const style = window.getComputedStyle(element);
  if (style.display === "none") {
    failures.push("Element has display:none");
  }
  if (style.visibility === "hidden") {
    failures.push("Element has visibility:hidden");
  }
  const opacity = parseFloat(style.opacity);
  if (opacity <= 0) {
    failures.push(`Element opacity is ${opacity} (must be > 0)`);
  }

  // ── Condition 6: Element contains text (LCP is contentful paint) ──
  const text = (element.textContent ?? "").trim();
  if (text.length === 0) {
    failures.push("Element has no text content");
  }

  return {
    pass: failures.length === 0,
    failures,
    element: {
      tagName,
      id,
      textContent: text.slice(0, 80),
    },
  };
}

/**
 * Set up a PerformanceObserver that resolves when the LCP entry is
 * captured. Returns a cleanup function.
 *
 * Use this in Playwright or in-browser to verify that the LCP element
 * is the expected one.
 *
 * @param onLcp — Callback receiving the LCP entry's element and timing.
 * @returns A cleanup function that disconnects the observer.
 */
export function observeLcp(
  onLcp: (lcpElement: Element | null, renderTime: number) => void,
): () => void {
  if (
    typeof window === "undefined" ||
    typeof PerformanceObserver === "undefined"
  ) {
    return () => {};
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) {
        const lcpEntry = last as PerformanceEntry & {
          element?: Element;
          renderTime?: number;
        };
        onLcp(lcpEntry.element ?? null, lcpEntry.renderTime ?? last.startTime);
      }
    });

    observer.observe({
      type: "largest-contentful-paint",
      buffered: true,
    });

    return () => observer.disconnect();
  } catch {
    // PerformanceObserver might not be available (SSR, older browsers)
    return () => {};
  }
}
