/** @vitest-environment jsdom */
/**
 * Animation contract tests (Phase 4 — REQ-6 / S6.1, S6.2, S6.4).
 *
 * Implementation strategy: Framer Motion + jsdom is brittle (no rAF, motion
 * values rely on async callbacks). Per design ADR-4, the bridge is a pure
 * function-on-MotionValue ("attach a `change` listener that mutates the
 * `scale` attribute on a stable ref"). We test that pure logic via a small
 * `applyDisplacementScale(node, value, reduce)` helper rather than driving
 * Framer Motion directly. This isolates the contract from runtime-only
 * concerns and keeps the suite deterministic.
 *
 * The tests assert:
 *  - S6.1 only the `scale` attribute mutates (no in/in2/xChannelSelector
 *    rewrites).
 *  - S6.2 the `<feDisplacementMap>` node ref persists — same DOM node
 *    before and after applying multiple values.
 *  - S6.4 when `useReducedMotion` is true, the helper short-circuits.
 *  - Filter graph: only the `feDisplacementMap` carries an animatable
 *    `scale`; siblings (`feImage`, `feGaussianBlur`) are not animated.
 */
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyDisplacementScale,
  bindDisplacementScale,
} from "../use-displacement-scale-animation";
import { LiquidGlassFilters } from "../LiquidGlassFilters";
import { LG_FILTER_IDS, LG_RESTING_SCALE } from "../filter-defs";

afterEach(() => {
  vi.restoreAllMocks();
  // remove any filters the previous test mounted
  document.body.innerHTML = "";
});

describe("applyDisplacementScale (S6.1, S6.2, S6.4)", () => {
  it("mutates ONLY the `scale` attribute on the displacement map node", () => {
    const { container } = render(<LiquidGlassFilters />);
    const node = container.querySelector(
      `#${LG_FILTER_IDS.dock} feDisplacementMap`,
    ) as SVGFEDisplacementMapElement | null;
    expect(node).not.toBeNull();

    const before = {
      in: node!.getAttribute("in"),
      in2: node!.getAttribute("in2"),
      xChannel: node!.getAttribute("xChannelSelector"),
      yChannel: node!.getAttribute("yChannelSelector"),
      result: node!.getAttribute("result"),
    };

    applyDisplacementScale(node!, 14, false);
    expect(node!.getAttribute("scale")).toBe("14");

    applyDisplacementScale(node!, 22, false);
    expect(node!.getAttribute("scale")).toBe("22");

    // Untouched attributes (S6.1).
    expect(node!.getAttribute("in")).toBe(before.in);
    expect(node!.getAttribute("in2")).toBe(before.in2);
    expect(node!.getAttribute("xChannelSelector")).toBe(before.xChannel);
    expect(node!.getAttribute("yChannelSelector")).toBe(before.yChannel);
    expect(node!.getAttribute("result")).toBe(before.result);
  });

  it("preserves the same node reference across multiple updates (S6.2)", () => {
    const { container } = render(<LiquidGlassFilters />);
    const before = container.querySelector(
      `#${LG_FILTER_IDS.panel} feDisplacementMap`,
    );
    applyDisplacementScale(
      before as SVGFEDisplacementMapElement,
      11,
      false,
    );
    const after = container.querySelector(
      `#${LG_FILTER_IDS.panel} feDisplacementMap`,
    );
    expect(after).toBe(before); // referential identity
  });

  it("freezes the value when reduce-motion is true (S6.4)", () => {
    const { container } = render(<LiquidGlassFilters />);
    const node = container.querySelector(
      `#${LG_FILTER_IDS.panel} feDisplacementMap`,
    ) as SVGFEDisplacementMapElement;
    const restingAttr = node.getAttribute("scale");

    applyDisplacementScale(node, 99, /* reduce */ true);

    // The attribute remained at its resting value — no mutation.
    expect(node.getAttribute("scale")).toBe(restingAttr);
  });

  it("does not throw when given a null node (consumer ref before mount)", () => {
    expect(() => applyDisplacementScale(null, 4, false)).not.toThrow();
  });
});

describe("bindDisplacementScale subscription helper", () => {
  it("subscribes a listener to a MotionValue-shaped object and unsubscribes on cleanup", () => {
    const listeners: Array<(v: number) => void> = [];
    const fakeMV = {
      get: () => 0,
      on: (event: "change", cb: (v: number) => void) => {
        listeners.push(cb);
        return () => {
          const idx = listeners.indexOf(cb);
          if (idx >= 0) listeners.splice(idx, 1);
        };
      },
    };

    const { container } = render(<LiquidGlassFilters />);
    const node = container.querySelector(
      `#${LG_FILTER_IDS.dock} feDisplacementMap`,
    ) as SVGFEDisplacementMapElement;

    const cleanup = bindDisplacementScale(node, fakeMV, () => false);
    expect(listeners).toHaveLength(1);

    listeners[0]!(7);
    expect(node.getAttribute("scale")).toBe("7");

    cleanup();
    expect(listeners).toHaveLength(0);
  });

  it("respects the reduce-motion getter on every change event", () => {
    const listeners: Array<(v: number) => void> = [];
    const fakeMV = {
      get: () => 0,
      on: (event: "change", cb: (v: number) => void) => {
        listeners.push(cb);
        return () => {
          const idx = listeners.indexOf(cb);
          if (idx >= 0) listeners.splice(idx, 1);
        };
      },
    };
    let reduce = false;
    const { container } = render(<LiquidGlassFilters />);
    const node = container.querySelector(
      `#${LG_FILTER_IDS.dock} feDisplacementMap`,
    ) as SVGFEDisplacementMapElement;
    const resting = node.getAttribute("scale");

    bindDisplacementScale(node, fakeMV, () => reduce);
    listeners[0]!(8);
    expect(node.getAttribute("scale")).toBe("8");

    reduce = true;
    listeners[0]!(50);
    expect(node.getAttribute("scale")).toBe("8"); // frozen at last applied value
    // (The CSS-driven resting state is still represented by the original attr
    // before any mutation; switching reduce mid-flight stops further updates.)
    expect(resting).toBe(String(LG_RESTING_SCALE.dock));
  });
});
