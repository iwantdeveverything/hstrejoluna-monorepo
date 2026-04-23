"use client";

import React from "react";
import { Link } from "@hstrejoluna/i18n";
import { useCookieConsent } from "@hstrejoluna/compliance";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CookieBanner() {
  const { shouldShowBanner, acceptAll, rejectAll } = useCookieConsent();
  const t = useTranslations("common.cookie_banner");
  const tCommon = useTranslations("common");

  // We use AnimatePresence so it unmounts gracefully when returning false
  return (
    <AnimatePresence>
      {shouldShowBanner && (
        <motion.aside
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          aria-label={t("title")}
          role="complementary"
          className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 bg-black/80 p-4 text-sm text-gray-300 backdrop-blur-md md:p-6"
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-emerald-400" aria-hidden="true" />
              <p className="flex-1">
                {t("portfolio_description")}{" "}
                <Link href="/privacy" className="text-emerald-400 transition-colors hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black">
                  {tCommon("privacy")}
                </Link>
                .
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:w-auto">
              <button
                onClick={rejectAll}
                className="rounded-br-xl rounded-tl-xl border border-gray-500/20 bg-gray-500/10 px-6 py-2 font-mono text-gray-400 transition-all hover:bg-gray-500/20 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                {t("reject")}
              </button>
              <button
                onClick={acceptAll}
                className="rounded-br-xl rounded-tl-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-2 font-mono text-emerald-400 transition-all hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                {t("accept")}
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
