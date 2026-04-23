"use client";

import React from "react";
import { Link } from "@hstrejoluna/i18n";
import { useCookieConsent } from "@hstrejoluna/compliance";
import { useTranslations } from "next-intl";

export default function CookieBanner() {
  const { shouldShowBanner, acceptAll, rejectAll } = useCookieConsent();
  const t = useTranslations("common.cookie_banner");
  const tCommon = useTranslations("common");

  if (!shouldShowBanner) return null;

  return (
    <aside 
      aria-label={t("title")}
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
    >
      <div className="mx-auto max-w-4xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl md:flex md:items-center md:justify-between gap-8">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900">{t("title")}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t("description")}{" "}
            <Link href="/privacy" className="text-salmon-600 underline">{tCommon("privacy")}</Link>.
          </p>
        </div>
        <div className="mt-6 flex items-center gap-4 md:mt-0">
          <button
            onClick={rejectAll}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            {t("reject")}
          </button>
          <button
            onClick={acceptAll}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-lg"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </aside>
  );
}
