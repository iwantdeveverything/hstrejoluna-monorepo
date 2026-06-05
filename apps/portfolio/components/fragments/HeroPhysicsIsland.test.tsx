/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { HeroPhysicsIsland } from './HeroPhysicsIsland';

// Mock LazyMotion
vi.mock('framer-motion', () => ({
  domAnimation: {},
  LazyMotion: ({ children, strict }: any) => (
    <div data-testid="lazy-motion" data-strict={strict}>
      {children}
    </div>
  ),
  m: { div: (props: any) => <div {...props} /> },
  useMotionValue: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
    on: vi.fn(),
  })),
  useSpring: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
    on: vi.fn(),
  })),
  useMotionValueEvent: vi.fn(),
}));

vi.mock('next/dynamic', () => ({
  default: () => () => <div data-testid="webgl-scene" />,
}));

vi.mock('../../lib/use-liquid-glass-gates', () => ({
  useHeroCapabilityGate: vi.fn(() => ({ canRender: true })),
}));

describe('HeroPhysicsIsland', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GREEN: mounts strict LazyMotion locally', () => {
    const { getByTestId } = render(<HeroPhysicsIsland />);
    const motion = getByTestId('lazy-motion');
    expect(motion).not.toBeNull();
    expect(motion.getAttribute('data-strict')).toBe('true');
  });
});
