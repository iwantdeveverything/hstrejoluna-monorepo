"use client";

import React from "react";
import Link from "next/link";
import { useCookieConsent } from "@hstrejoluna/compliance";

export default function CookieBanner() {
  const { shouldShowBanner, acceptAll, rejectAll } = useCookieConsent();

  if (!shouldShowBanner) return null;

  return (
    <aside 
      aria-label="Cookie Consent"
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
    >
      <div className="mx-auto max-w-4xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl md:flex md:items-center md:justify-between gap-8">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900">Privacy & Tracking</h2>
          <p className="mt-2 text-sm text-slate-600">
            We use cookies to improve your experience and track site usage. By clicking "Accept All", you consent to our use of tracking for analytics and marketing. 
            View our <Link href="/privacy" className="text-salmon-600 underline">Privacy Policy</Link>.
          </p>
        </div>
        <div className="mt-6 flex items-center gap-4 md:mt-0">
          <button
            onClick={rejectAll}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Strictly Necessary
          </button>
          <button
            onClick={acceptAll}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-lg"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
