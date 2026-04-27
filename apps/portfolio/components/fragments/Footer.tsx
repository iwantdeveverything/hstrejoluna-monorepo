"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { Copyleft } from "lucide-react";
import { clearConsentState } from "@hstrejoluna/compliance";
import { useTranslations } from "next-intl";

export default function Footer() {
  const tFooter = useTranslations("footer");
  const currentYear = new Date().getFullYear();
  const legalActionClassName =
    "transition-colors hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black";

  const handleManageCookies = () => {
    clearConsentState();
    window.location.reload();
  };

  return (
    <footer className="relative z-50 mt-20 border-t border-white/10 bg-black/50 py-8 backdrop-blur-sm sm:mt-32">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-8 lg:px-12">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Copyleft className="h-4 w-4" aria-hidden="true" />
          <span>
            {currentYear} Dark Kinetic. {tFooter("freeFork")}
          </span>
        </div>

        <nav
          aria-label="Legal Navigation"
          className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-400"
        >
          <Link href="/privacy" className={legalActionClassName}>
            {tFooter("privacyPolicy")}
          </Link>
          <Link href="/cookies" className={legalActionClassName}>
            {tFooter("cookiePolicy")}
          </Link>
          <Link href="/legal" className={legalActionClassName}>
            {tFooter("legalNotice")}
          </Link>
          <button
            type="button"
            onClick={handleManageCookies}
            className={legalActionClassName}
          >
            {tFooter("manageCookies")}
          </button>
        </nav>
      </div>
    </footer>
  );
}
