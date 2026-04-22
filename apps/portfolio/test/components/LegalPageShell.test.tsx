/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { LegalPageShell } from '@hstrejoluna/ui';

describe('LegalPageShell Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders title and children correctly', () => {
    render(
      <LegalPageShell title="Test Policy" lastUpdated="April 2026">
        <p>This is a test policy content.</p>
      </LegalPageShell>
    );

    expect(screen.getByText('Test Policy')).toBeDefined();
    expect(screen.getByText('Last updated: April 2026')).toBeDefined();
    expect(screen.getByText('This is a test policy content.')).toBeDefined();
  });

  it('includes mandatory contact information section', () => {
    render(
      <LegalPageShell title="Privacy" lastUpdated="April 2026">
        <p>Content</p>
      </LegalPageShell>
    );

    expect(screen.getByRole('heading', { name: /Contact Information/i, level: 2 })).toBeDefined();
    expect(screen.getByText(/trejolunatutoriales@gmail.com/i)).toBeDefined();
  });
});
