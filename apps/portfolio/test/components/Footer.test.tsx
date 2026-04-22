/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import Footer from '../../components/fragments/Footer';

describe('Footer Component (Legal)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all mandatory legal links', () => {
    render(<Footer />);
    
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    const cookiesLink = screen.getByRole('link', { name: /Cookie Policy/i });
    const legalLink = screen.getByRole('link', { name: /Legal Notice/i });

    expect(privacyLink.getAttribute('href')).toBe('/privacy');
    expect(cookiesLink.getAttribute('href')).toBe('/cookies');
    expect(legalLink.getAttribute('href')).toBe('/legal');
  });

  it('renders a button to manage cookie preferences', () => {
    render(<Footer />);
    
    const manageButton = screen.getByRole('button', { name: /Manage Cookies/i });
    expect(manageButton).toBeDefined();
  });

  it('displays the brand/copyright with a year', () => {
    render(<Footer />);
    // Match text regardless of spans, looking for YYYY Dark Kinetic
    expect(screen.getByText((content) => content.includes('Dark Kinetic') && /\d{4}/.test(content))).toBeDefined();
  });
});
