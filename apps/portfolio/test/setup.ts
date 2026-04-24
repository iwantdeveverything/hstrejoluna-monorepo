import "@testing-library/jest-dom/vitest";
import { vi } from 'vitest';
import React from 'react';

// Mock next-intl to provide translation keys as values in tests
vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useTranslations: (namespace?: string) => (key: string) => namespace ? `${namespace}.${key}` : key,
    useLocale: () => 'en',
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock next-intl/navigation
vi.mock('next-intl/navigation', () => {
  const fns = {
    Link: ({ children, href, ...props }: React.PropsWithChildren<{ href: string; [key: string]: unknown }>) => React.createElement('a', { href, ...props }, children),
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    usePathname: () => '/',
    redirect: vi.fn(),
    permanentRedirect: vi.fn(),
  };
  return {
    ...fns,
    createNavigation: () => fns,
    createSharedPathnamesNavigation: () => fns,
  };
});
