export function setupHeroCursorField(element: HTMLElement): () => void {
  // Check if user prefers reduced motion
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return () => {}; // Inert under reduced motion
  }

  let rafId: number | null = null;
  let lastX = 0;
  let lastY = 0;

  const updatePosition = () => {
    element.style.setProperty('--mx', lastX.toString());
    element.style.setProperty('--my', lastY.toString());
    rafId = null;
  };

  const handlePointerMove = (e: PointerEvent | Event) => {
    // We expect PointerEvent, but TS might see Event depending on how it's attached
    const pointerEvent = e as PointerEvent;
    
    // Closure var update (fast)
    lastX = pointerEvent.clientX;
    lastY = pointerEvent.clientY;

    // Guarded rAF (schedules at most one frame per render cycle)
    if (rafId === null) {
      rafId = window.requestAnimationFrame(updatePosition);
    }
  };

  // Add listener
  window.addEventListener('pointermove', handlePointerMove);

  // Return cleanup function
  return () => {
    window.removeEventListener('pointermove', handlePointerMove);
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
    }
  };
}
