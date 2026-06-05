/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import {
  createHeroUniforms,
  HERO_UNIFORM_NAMES,
  type HeroUniforms,
} from './hero-uniform-store';

describe('hero-uniform-store', () => {
  describe('HERO_UNIFORM_NAMES (drei drift snapshot)', () => {
    it('RED: exports exactly uMouse, uScroll, uBurst — fails loud on drei minor drift', () => {
      expect(HERO_UNIFORM_NAMES).toMatchInlineSnapshot(`
        [
          "uMouse",
          "uScroll",
          "uBurst",
        ]
      `);
    });

    it('RED: uniform names array has exactly 3 entries', () => {
      expect(HERO_UNIFORM_NAMES).toHaveLength(3);
    });
  });

  describe('createHeroUniforms', () => {
    it('RED: creates uniforms with correct initial values', () => {
      const uniforms = createHeroUniforms();

      // uMouse is a vec2 (array of 2 floats)
      expect(uniforms.uMouse.value).toEqual([0, 0]);

      // uScroll is a float
      expect(uniforms.uScroll.value).toBe(0);

      // uBurst is a float (entrance clip 0→1)
      expect(uniforms.uBurst.value).toBe(0);
    });

    it('RED: each uniform has a value property suitable for three.js shader injection', () => {
      const uniforms = createHeroUniforms();

      // Every uniform must have a { value } shape that three.js expects
      for (const name of HERO_UNIFORM_NAMES) {
        expect(uniforms[name]).toHaveProperty('value');
      }
    });

    it('TRIANGULATE: factory produces independent instances', () => {
      const a = createHeroUniforms();
      const b = createHeroUniforms();

      // Mutate a
      a.uMouse.value = [42, 99];
      a.uScroll.value = 7;
      a.uBurst.value = 1;

      // b must be unaffected
      expect(b.uMouse.value).toEqual([0, 0]);
      expect(b.uScroll.value).toBe(0);
      expect(b.uBurst.value).toBe(0);
    });
  });
});
