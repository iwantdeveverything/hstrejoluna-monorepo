"use client";

import React from "react";
import Link from "next/link";
import { clearConsentState } from "@hstrejoluna/compliance";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleManageCookies = () => {
    clearConsentState();
    window.location.reload();
  };

  return (
    <footer className="mt-20 border-t border-slate-100 bg-slate-50/50 py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-sm text-slate-500">
          © {currentYear} Maestros del Salmon. Portfolio Microsite.
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/privacy" className="hover:text-salmon-600 transition-colors">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-salmon-600 transition-colors">Cookie Policy</Link>
          <Link href="/legal" className="hover:text-salmon-600 transition-colors">Legal Notice</Link>
          <button 
            onClick={handleManageCookies}
            className="hover:text-salmon-600 transition-colors"
          >
            Manage Cookies
          </button>
        </nav>
      </div>
    </footer>
  );
}
