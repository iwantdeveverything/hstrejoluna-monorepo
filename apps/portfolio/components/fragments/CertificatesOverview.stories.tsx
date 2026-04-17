import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CertificatesOverview } from "./CertificatesOverview";

const meta = {
  title: "Fragments/CertificatesOverview",
  component: CertificatesOverview,
  args: {
    certificates: [
      {
        _id: "cert-1",
        name: "Professional Frontend Certificate",
        issuer: "LinkedIn Learning",
        issueDate: "2025-08-12T00:00:00.000Z",
        credentialUrl: "https://linkedin.com/certificates/example-1",
        source: "linkedin",
      },
      {
        _id: "cert-2",
        name: "Advanced TypeScript",
        issuer: "LinkedIn Learning",
        issueDate: "2024-12-03T00:00:00.000Z",
        source: "linkedin",
      },
    ],
  },
} satisfies Meta<typeof CertificatesOverview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyState: Story = {
  args: {
    certificates: [],
  },
};
