import "@testing-library/jest-dom/vitest";
import { vi } from 'vitest';

// Mock next-intl to provide translation keys as values in tests
vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useTranslations: (namespace?: string) => (key: string) => namespace ? `${namespace}.${key}` : key,
  };
});
