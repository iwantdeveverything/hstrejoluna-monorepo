import { expect, test } from "@playwright/test";

test.describe("Hero — Liquid Glass Memory Leak (e2e)", () => {
  test("hero mount/unmount cycle does not leak memory", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "performance.memory and gc() are Chromium-only APIs; this test only runs on Desktop Chrome Memory Leak project",
    );

    test.setTimeout(90_000);

    await page.setViewportSize({ width: 1440, height: 900 });

    // Helper: measure JS heap size after attempting GC
    const measureHeap = async (): Promise<number> => {
      // Force GC if available (Chromium with --js-flags=--expose-gc)
      try {
        await page.evaluate(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (typeof (globalThis as any).gc === "function") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).gc();
          }
        });
      } catch {
        // GC not available — skip
      }
      await page.waitForTimeout(500);

      // Use performance.memory if available (Chromium only)
      const heap = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mem = (performance as any).memory;
        return mem?.usedJSHeapSize ?? 0;
      });
      return heap;
    };

    // Baseline: load the home page and let WebGL init
    await page.goto("/");
    await page.waitForTimeout(3000); // let dynamic import + WebGL init
    const baselineHeap = await measureHeap();

    // Cycle: navigate away and back 5 times (use /legal as valid alt route)
    for (let i = 0; i < 5; i++) {
      await page.goto("/legal", { waitUntil: "load" });
      await page.waitForTimeout(1000);
      await page.goto("/", { waitUntil: "load" });
      await page.waitForTimeout(2000); // let WebGL re-init
    }

    const finalHeap = await measureHeap();

    // Heap growth should be less than 20 MB
    const heapDeltaMB = (finalHeap - baselineHeap) / (1024 * 1024);
    expect(heapDeltaMB).toBeLessThan(20);
  });
});
