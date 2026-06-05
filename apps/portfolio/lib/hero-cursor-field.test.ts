/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupHeroCursorField } from './hero-cursor-field';

describe('setupHeroCursorField', () => {
  let element: HTMLElement;
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
    vi.useFakeTimers();

    matchMediaMock = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    document.body.removeChild(element);
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('GREEN: pointermove drives --mx/--my via single rAF', () => {
    const setPropertySpy = vi.spyOn(element.style, 'setProperty');
    const rAFSpy = vi.spyOn(window, 'requestAnimationFrame');

    const cleanup = setupHeroCursorField(element);

    // Trigger pointermove
    const event = new window.PointerEvent('pointermove', {
      clientX: 100,
      clientY: 200,
    });
    window.dispatchEvent(event);

    // Expect rAF to be scheduled but not executed immediately
    expect(rAFSpy).toHaveBeenCalledTimes(1);
    expect(setPropertySpy).not.toHaveBeenCalled();

    // Fast-forward rAF
    vi.runAllTimers();

    expect(setPropertySpy).toHaveBeenCalledWith('--mx', '100');
    expect(setPropertySpy).toHaveBeenCalledWith('--my', '200');

    // Trigger multiple pointermoves before next rAF
    window.dispatchEvent(new window.PointerEvent('pointermove', { clientX: 110, clientY: 210 }));
    window.dispatchEvent(new window.PointerEvent('pointermove', { clientX: 120, clientY: 220 }));

    // rAF should only be scheduled once per frame
    expect(rAFSpy).toHaveBeenCalledTimes(2);

    vi.runAllTimers();

    expect(setPropertySpy).toHaveBeenCalledWith('--mx', '120');
    expect(setPropertySpy).toHaveBeenCalledWith('--my', '220');

    cleanup();
  });

  it('GREEN: inert under prefers-reduced-motion', () => {
    matchMediaMock.mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const setPropertySpy = vi.spyOn(element.style, 'setProperty');
    const cleanup = setupHeroCursorField(element);

    window.dispatchEvent(new window.PointerEvent('pointermove', { clientX: 100, clientY: 200 }));
    vi.runAllTimers();

    expect(setPropertySpy).not.toHaveBeenCalled();
    cleanup();
  });

  it('GREEN: cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const cleanup = setupHeroCursorField(element);

    cleanup();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
  });
});
