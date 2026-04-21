
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Dark Kinetic",
  description: "Cookie policy and tracking information for Dark Kinetic.",
};

export default function CookiePolicy() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl relative z-10">
      <div className="prose prose-invert prose-emerald max-w-none">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Cookie Policy</h1>
        <p className="text-gray-400">Last updated: April 2026</p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-white">1. What Are Cookies?</h2>
          <p className="mt-4 text-gray-300">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
            They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-white">2. How We Use Cookies</h2>
          <p className="mt-4 text-gray-300">
            We use a single <code>consent_preferences</code> item in your local storage to remember your choice regarding analytics. 
            We do not use third-party marketing cookies, cross-site trackers, or invasive CMP bloatware. Our philosophy is maximum performance and maximum privacy.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-white">3. Managing Your Preferences</h2>
          <p className="mt-4 text-gray-300">
            If you have enabled Global Privacy Control (GPC) in your browser, your preferences are already strictly managed by your browser and respected by our site.
            If you accepted our banner, you can clear your browser's local storage to reset your consent state.
          </p>
        </section>
      </div>
    </div>
  );
}
