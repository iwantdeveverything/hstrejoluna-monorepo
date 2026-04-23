/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import PrivacyPage from '../../app/[locale]/privacy/page';
import CookiesPage from '../../app/[locale]/cookies/page';
import LegalPage from '../../app/[locale]/legal/page';

describe('Legal Pages Integration (Portfolio)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders Privacy Policy page correctly', () => {
    render(<PrivacyPage />);
    expect(screen.getByRole('heading', { name: /Privacy Policy/i, level: 1 })).toBeDefined();
    expect(screen.getByText(/Contact Information/i)).toBeDefined();
  });

  it('renders Cookie Policy page correctly', () => {
    render(<CookiesPage />);
    expect(screen.getByRole('heading', { name: /Cookie Policy/i, level: 1 })).toBeDefined();
    expect(screen.getByText(/Contact Information/i)).toBeDefined();
  });

  it('renders Legal Notice page correctly', () => {
    render(<LegalPage />);
    expect(screen.getByRole('heading', { name: /Legal Notice/i, level: 1 })).toBeDefined();
    expect(screen.getByText(/Contact Information/i)).toBeDefined();
  });
});
