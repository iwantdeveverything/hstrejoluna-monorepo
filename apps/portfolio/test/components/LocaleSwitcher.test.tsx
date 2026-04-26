/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockReplace = vi.fn();

vi.mock('next-intl', () => ({
  useLocale: () => 'es',
}));

vi.mock('@hstrejoluna/i18n', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/projects',
  locales: ['en', 'es'] as const,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}));

import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('renders locale buttons for all locales', () => {
    render(<LocaleSwitcher />);
    expect(screen.getByText('en')).toBeDefined();
    expect(screen.getByText('es')).toBeDefined();
  });

  it('calls router.replace with correct locale on click', () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByText('en'));
    expect(mockReplace).toHaveBeenCalledWith('/projects', { locale: 'en' });
  });

  it('does not crash when clicking the active locale', () => {
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByText('es'));
    expect(mockReplace).toHaveBeenCalledWith('/projects', { locale: 'es' });
  });
});
