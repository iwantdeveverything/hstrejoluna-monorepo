/// <reference types="vitest/globals" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CertificatesPanel } from "./CertificatesPanel";
import type { CertificatesPanelItem } from "./CertificatesPanel";

const mockCertificates: CertificatesPanelItem[] = [
  {
    _id: "cert-1",
    name: "AWS Solutions Architect",
    issuer: "Amazon Web Services",
    issueDate: "2024-01-15",
    credentialUrl: "https://aws.example.com/cert/1",
    source: "AWS",
  },
  {
    _id: "cert-2",
    name: "Google Cloud Professional",
    issuer: "Google Cloud",
    issueDate: "2023-11-20",
    credentialUrl: "https://gcp.example.com/cert/2",
    source: "Google",
  },
  {
    _id: "cert-3",
    name: "No Credential URL",
    issuer: "Some Org",
    source: "Other",
    // No credentialUrl — link not rendered
  },
];

describe("CertificatesPanel — Accessibility", () => {
  it("renders credential links with unique accessible names including certificate name", () => {
    render(<CertificatesPanel certificates={mockCertificates} />);

    // Each "View Credential" link should have a unique accessible name
    const awsLink = screen.getByRole("link", {
      name: /View Credential: AWS Solutions Architect/,
    });
    expect(awsLink).toBeInTheDocument();
    expect(awsLink).toHaveAttribute("href", "https://aws.example.com/cert/1");

    const gcpLink = screen.getByRole("link", {
      name: /View Credential: Google Cloud Professional/,
    });
    expect(gcpLink).toBeInTheDocument();
    expect(gcpLink).toHaveAttribute("href", "https://gcp.example.com/cert/2");
  });

  it("does not render a link for certificates without credentialUrl", () => {
    render(<CertificatesPanel certificates={mockCertificates} />);

    // No link should exist for cert-3 (no credentialUrl)
    const links = screen.queryByRole("link", {
      name: /No Credential URL/,
    });
    expect(links).not.toBeInTheDocument();
  });

  it("renders no links when all certificates lack credentialUrl", () => {
    const noUrlCerts: CertificatesPanelItem[] = [
      {
        _id: "cert-4",
        name: "Internal Training",
        source: "Company",
      },
    ];

    render(<CertificatesPanel certificates={noUrlCerts} />);

    const links = screen.queryAllByRole("link");
    expect(links.length).toBe(0);
  });
});
