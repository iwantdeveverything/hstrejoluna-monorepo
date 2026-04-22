import type { Metadata } from "next";
import { LegalPageShell } from "@hstrejoluna/ui";

export const metadata: Metadata = {
  title: "Privacy Policy | Dark Kinetic",
  description: "Privacy policy and GDPR compliance information for Dark Kinetic.",
};

export default function PrivacyPolicy() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated="April 2026">
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
        <p className="mt-4 text-gray-300">
          Welcome to the Dark Kinetic Portfolio. We respect your privacy and are committed to protecting your personal data. 
          This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">2. Data We Collect</h2>
        <p className="mt-4 text-gray-300">
          We operate under a strict data minimization principle. We only collect basic anonymous telemetry (if consented) to understand page load performance.
          We <strong>do not</strong> collect identifying Personally Identifiable Information (PII) through this front-end portfolio.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">3. Global Privacy Control (GPC)</h2>
        <p className="mt-4 text-gray-300">
          We natively respect the <strong>Global Privacy Control</strong> signal. If your browser supports and injects <code>navigator.globalPrivacyControl</code>, 
          we automatically opt you out of all non-essential scripts and cookies without showing you a disruptive banner.
        </p>
      </section>
    </LegalPageShell>
  );
}
