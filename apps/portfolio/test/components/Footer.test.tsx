/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import Footer from '../../components/fragments/Footer';

describe('Footer Component (Legal)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all mandatory legal links with i18n keys', () => {
    render(<Footer />);
    
    // Our next-intl mock returns the full key (namespace.key)
    const privacyLink = screen.getByRole('link', { name: /common.privacy/i });
    const cookiesLink = screen.getByRole('link', { name: /common.cookies/i });
    const legalLink = screen.getByRole('link', { name: /common.legal/i });

    expect(privacyLink.getAttribute('href')).toBe('/privacy');
    expect(cookiesLink.getAttribute('href')).toBe('/cookies');
    expect(legalLink.getAttribute('href')).toBe('/legal');
  });

  it('renders a button to manage cookie preferences with i18n key', () => {
    render(<Footer />);
    
    const manageButton = screen.getByRole('button', { name: /common.manage_cookies/i });
    expect(manageButton).toBeDefined();
  });

  it('displays the brand/copyright with a year', () => {
    render(<Footer />);
    expect(screen.getByText((content) => content.includes('Dark Kinetic') && /\d{4}/.test(content))).toBeDefined();
  });
});
