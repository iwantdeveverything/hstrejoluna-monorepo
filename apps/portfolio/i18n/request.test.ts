import { describe, it, expect, vi } from 'vitest';
import requestConfig from './request';

vi.mock('next-intl/server', () => ({
  getRequestConfig: (fn: (args: { requestLocale: Promise<string | undefined> }) => Promise<unknown>) => fn
}));

describe('i18n Request Configuration (v4 API)', () => {
  it('returns valid messages for supported locales', async () => {
    const configEn = await (requestConfig as (args: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: Record<string, unknown> }>)({
      requestLocale: Promise.resolve('en')
    });
    expect(configEn.locale).toBe('en');
    expect(configEn.messages).toBeDefined();

    const configEs = await (requestConfig as (args: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: Record<string, unknown> }>)({
      requestLocale: Promise.resolve('es')
    });
    expect(configEs.locale).toBe('es');
    expect(configEs.messages).toBeDefined();
  });

  it('falls back to es for unsupported locales', async () => {
    const config = await (requestConfig as (args: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: Record<string, unknown> }>)({
      requestLocale: Promise.resolve('fr')
    });
    expect(config.locale).toBe('es');
    expect(config.messages).toBeDefined();
  });

  it('falls back to es when requestLocale is undefined', async () => {
    const config = await (requestConfig as (args: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: Record<string, unknown> }>)({
      requestLocale: Promise.resolve(undefined)
    });
    expect(config.locale).toBe('es');
  });
});
