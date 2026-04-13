import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CertificatesOverview } from "./CertificatesOverview";

describe("CertificatesOverview", () => {
  it("renders certificate metadata and credential links when available", () => {
    render(
      <CertificatesOverview
        certificates={[
          {
            _id: "certificate.linkedin.a-1",
            name: "AWS Certified Developer",
            issuer: "Amazon Web Services",
            issueDate: "2024-03-01",
            credentialUrl: "https://example.com/cert",
            source: "linkedin",
          },
        ]}
      />
    );

    expect(screen.getByText("AWS Certified Developer")).toBeInTheDocument();
    expect(screen.getByText("Amazon Web Services")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /view credential/i })
    ).toHaveAttribute("href", "https://example.com/cert");
  });

  it("shows empty state when certificates list is empty", () => {
    render(<CertificatesOverview certificates={[]} />);

    expect(screen.getByText(/certificate_stream: empty/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No synced certificates yet/i)
    ).toBeInTheDocument();
  });
});
