import { describe, it, expect } from 'vitest';
import robots from './robots';

describe('Metadata: robots.ts (Portfolio)', () => {
  it('returns valid robots configuration pointing to the sitemap', () => {
    const config = robots();
    
    expect(config.rules).toBeDefined();
    expect(config.sitemap).toContain('hstrejoluna.com/sitemap.xml');
  });

  it('allows all crawlers by default', () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    
    expect(rules.some(r => r.userAgent === '*' && r.allow === '/')).toBe(true);
  });
});
