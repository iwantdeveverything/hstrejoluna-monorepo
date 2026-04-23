"use client";

import React from "react";
import { Link } from "@hstrejoluna/i18n";
import { clearConsentState } from "@hstrejoluna/compliance";
import { useTranslations } from "next-intl";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations("common");

  const handleManageCookies = () => {
    clearConsentState();
    window.location.reload();
  };

  return (
    <footer className="mt-20 border-t border-slate-100 bg-slate-50/50 py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-sm text-slate-500">
          © {currentYear} Maestros del Salmon. {t("footer.salmon_tagline")}
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/privacy" className="hover:text-salmon-600 transition-colors">{t("privacy")}</Link>
          <Link href="/cookies" className="hover:text-salmon-600 transition-colors">{t("cookies")}</Link>
          <Link href="/legal" className="hover:text-salmon-600 transition-colors">{t("legal")}</Link>
          <button 
            onClick={handleManageCookies}
            className="hover:text-salmon-600 transition-colors"
          >
            {t("manage_cookies")}
          </button>
        </nav>
      </div>
    </footer>
  );
}
