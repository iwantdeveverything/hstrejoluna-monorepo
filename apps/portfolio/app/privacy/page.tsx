
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Dark Kinetic",
  description: "Privacy policy and GDPR compliance information for Dark Kinetic.",
};

export default function PrivacyPolicy() {
  return (
    <div id="main-content" className="container mx-auto px-4 py-16 md:py-24 max-w-4xl relative z-10">
      <div className="prose prose-invert prose-emerald max-w-none">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Privacy Policy</h1>
        <p className="text-gray-400">Last updated: April 2026</p>

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

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-white">4. Contact us</h2>
          <p className="mt-4 text-gray-300">
            If you have any questions about this privacy policy or our privacy practices, please contact us via our official GitHub repository.
          </p>
        </section>
      </div>
    </div>
  );
}
