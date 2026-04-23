import { describe, it, expect, vi } from 'vitest';
import requestConfig from './request';

// We need to mock next-intl/server because getRequestConfig is a wrapper
vi.mock('next-intl/server', () => ({
  getRequestConfig: (fn: any) => fn
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn()
}));

import { notFound } from 'next/navigation';

describe('i18n Request Configuration', () => {
  it('returns valid message objects for supported locales', async () => {
    // @ts-ignore - implementation is the exported function due to mock
    const configEn = await requestConfig({ locale: 'en' });
    expect(configEn.locale).toBe('en');
    expect(configEn.messages).toBeDefined();
    expect(configEn.messages.common).toBeDefined();

    // @ts-ignore
    const configEs = await requestConfig({ locale: 'es' });
    expect(configEs.locale).toBe('es');
    expect(configEs.messages).toBeDefined();
    expect(configEs.messages.common).toBeDefined();
  });

  it('calls notFound for unsupported locales', async () => {
    // @ts-ignore
    await requestConfig({ locale: 'fr' });
    expect(notFound).toHaveBeenCalled();
  });
});
