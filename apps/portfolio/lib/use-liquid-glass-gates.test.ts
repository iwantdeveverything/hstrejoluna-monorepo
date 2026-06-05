/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHeroCapabilityGate } from './use-liquid-glass-gates';

describe('useHeroCapabilityGate', () => {
  beforeEach(() => {
    // Reset stubs
    vi.unstubAllGlobals();

    // Default GREEN state mock
    vi.stubGlobal('navigator', {
      hardwareConcurrency: 4,
    });
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    });
    // Stub WebGL2 support
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) => {
      return type === 'webgl2' ? ({} as any) : null;
    }) as any);
    
    // Default Flag
    vi.stubEnv('NEXT_PUBLIC_HERO_LIQUID', 'on');
  });

  it('GREEN: returns canRender: true when all capabilities pass', () => {
    const { result } = renderHook(() => useHeroCapabilityGate());
    expect(result.current.canRender).toBe(true);
  });

  it('GREEN: returns false if WebGL2 context is missing', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { result } = renderHook(() => useHeroCapabilityGate());
    expect(result.current.canRender).toBe(false);
  });

  it('GREEN: returns false if prefers-reduced-motion is true', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockImplementation((q) => ({
        matches: q === '(prefers-reduced-motion: reduce)',
      })),
    });
    const { result } = renderHook(() => useHeroCapabilityGate());
    expect(result.current.canRender).toBe(false);
  });

  it('GREEN: returns false if prefers-reduced-data is true', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockImplementation((q) => ({
        matches: q === '(prefers-reduced-data: reduce)',
      })),
    });
    const { result } = renderHook(() => useHeroCapabilityGate());
    expect(result.current.canRender).toBe(false);
  });

  it('GREEN: returns false if prefers-reduced-transparency is true', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockImplementation((q) => ({
        matches: q === '(prefers-reduced-transparency: reduce)',
      })),
    });
    const { result } = renderHook(() => useHeroCapabilityGate());
    expect(result.current.canRender).toBe(false);
  });

  it('GREEN: returns false on mobile devices (pointer: coarse)', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockImplementation((q) => ({
        matches: q === '(pointer: coarse)',
      })),
    });
    const { result } = renderHook(() => useHeroCapabilityGate());
    expect(result.current.canRender).toBe(false);
  });

  it('GREEN: returns false if hardware concurrency is < 4', () => {
    vi.stubGlobal('navigator', {
      hardwareConcurrency: 3,
    });
    const { result } = renderHook(() => useHeroCapabilityGate());
    expect(result.current.canRender).toBe(false);
  });

  it('GREEN: returns false if NEXT_PUBLIC_HERO_LIQUID is off', () => {
    vi.stubEnv('NEXT_PUBLIC_HERO_LIQUID', 'off');
    const { result } = renderHook(() => useHeroCapabilityGate());
    expect(result.current.canRender).toBe(false);
  });
});
