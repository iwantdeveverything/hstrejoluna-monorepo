/** @vitest-environment jsdom */
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import PrivacyPage from './page';

describe('Legal Alignment (Maestros del Salmon)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders Privacy Policy page correctly', () => {
    render(<PrivacyPage />);
    expect(screen.getByRole('heading', { name: /Privacy Policy/i, level: 1 })).toBeDefined();
    // Use a more specific text from the shell/component
    expect(screen.getAllByText(/Maestros del Salmon/i).length).toBeGreaterThan(0);
  });
});
