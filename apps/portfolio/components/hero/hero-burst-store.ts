/**
 * hero-burst-store — the once-per-page-load entrance burst latch + capped
 * click re-burst (design §4.4; spec: Entrance burst splash).
 *
 * Replaces the deleted `fragments/hero-uniform-store.ts`. The burst is a
 * module-scoped signal: it ramps `0 → 1 → idle` over `BURST_DURATION_MS`
 * (≤ 1200ms) EXACTLY ONCE per page load. The latch (`hasPlayed`) lives at
 * module scope, so a component remount firing `canplay` again will NOT replay
 * the entrance burst. Pointer clicks inside the hero trigger a SMALL capped
 * re-burst (`triggerClickBurst`), which is intentionally NOT latched.
 *
 * Consumers:
 *  - webgl tier: `useFrame` reads `getBurstValue()` → `uBurst` uniform.
 *  - css tier:   the value feeds `computeDisplacementScale({ burst })`.
 * Subscribers (`subscribeBurst`) drive React-side state (css tier) without the
 * store importing React.
 *
 * The ramp is animated by `requestAnimationFrame` reading `performance.now()`.
 * Reduced-motion never reaches here: the gate forces the `static` tier, which
 * renders no backdrop, so `triggerBurst` is never called under reduce.
 */

/** Entrance burst total duration in ms (spec: ≤ 1200ms). */
export const BURST_DURATION_MS = 1200;

/** Click re-burst amplitude cap — well below the full entrance peak. */
export const CLICK_BURST_AMPLITUDE = 0.35;

type BurstSubscriber = (value: number) => void;

let hasPlayed = false;
let currentValue = 0;
let rafId = 0;
let rampStart = 0;
let rampAmplitude = 1;
const subscribers = new Set<BurstSubscriber>();

/**
 * Pure ramp shape: a smooth `0 → peak → 0` pulse over `BURST_DURATION_MS`,
 * scaled by `amplitude`. A single sine lobe (`sin(π·t)`) gives a symmetric
 * rise and fall that starts and ends at exactly 0 with the peak at the middle.
 */
export const computeBurstSignal = (
  elapsedMs: number,
  amplitude = 1,
): number => {
  if (elapsedMs <= 0) return 0;
  if (elapsedMs >= BURST_DURATION_MS) return 0;
  const progress = elapsedMs / BURST_DURATION_MS;
  return Math.sin(Math.PI * progress) * amplitude;
};

const notify = (value: number) => {
  for (const subscriber of subscribers) subscriber(value);
};

const stopRamp = () => {
  if (rafId !== 0) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  currentValue = 0;
  notify(0);
};

const tick = () => {
  const elapsed = performance.now() - rampStart;
  if (elapsed >= BURST_DURATION_MS) {
    rafId = 0;
    currentValue = 0;
    notify(0);
    return;
  }
  currentValue = computeBurstSignal(elapsed, rampAmplitude);
  notify(currentValue);
  rafId = requestAnimationFrame(tick);
};

const startRamp = (amplitude: number) => {
  rampStart = performance.now();
  rampAmplitude = amplitude;
  currentValue = 0;
  if (rafId !== 0) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
};

/**
 * Fire the entrance burst. Returns `true` if it started, `false` if it was
 * already played this page load (latched). Call from `HeroVideoLayer` on the
 * first `canplay`.
 */
export const triggerBurst = (): boolean => {
  if (hasPlayed) return false;
  hasPlayed = true;
  startRamp(1);
  return true;
};

/**
 * Fire a small capped re-burst (pointer click inside the hero). Not latched —
 * each click replays, but the amplitude is capped at `CLICK_BURST_AMPLITUDE`.
 */
export const triggerClickBurst = (): void => {
  startRamp(CLICK_BURST_AMPLITUDE);
};

/** Current burst value (read by `useFrame` for the `uBurst` uniform). */
export const getBurstValue = (): number => currentValue;

/** Whether the once-per-page-load entrance burst has already fired. */
export const hasBurstPlayedOnce = (): boolean => hasPlayed;

/** Subscribe to burst value changes. Returns an unsubscribe fn. */
export const subscribeBurst = (subscriber: BurstSubscriber): (() => void) => {
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
};

/**
 * Test-only reset of the module-scoped latch and animation state. Production
 * code never calls this — the latch is meant to survive for the page lifetime.
 */
export const resetBurstStoreForTest = (): void => {
  if (rafId !== 0) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  hasPlayed = false;
  currentValue = 0;
  rampStart = 0;
  rampAmplitude = 1;
  subscribers.clear();
};
