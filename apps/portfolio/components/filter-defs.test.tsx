/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HeroRefractionFilter, REFRACTION_FILTER_ID } from './filter-defs';

describe('HeroRefractionFilter', () => {
  it('RED: renders an SVG with feTurbulence, feGaussianBlur, and feDisplacementMap', () => {
    const { container } = render(<HeroRefractionFilter />);
    const filter = container.querySelector(`filter#${REFRACTION_FILTER_ID}`);
    expect(filter).not.toBeNull();

    const turbulence = filter?.querySelector('feTurbulence');
    expect(turbulence).not.toBeNull();
    expect(turbulence?.getAttribute('type')).toBe('fractalNoise');
    expect(turbulence?.getAttribute('baseFrequency')).toBe('0.008');
    expect(turbulence?.getAttribute('numOctaves')).toBe('2');

    const blur = filter?.querySelector('feGaussianBlur');
    expect(blur).not.toBeNull();

    const displacement = filter?.querySelector('feDisplacementMap');
    expect(displacement).not.toBeNull();
  });
});
