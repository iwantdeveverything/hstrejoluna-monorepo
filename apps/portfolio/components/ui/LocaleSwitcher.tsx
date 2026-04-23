"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname, locales, type Locale } from "@hstrejoluna/i18n";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface LocaleSwitcherProps {
  id?: string;
}

const LocaleSwitcherContent = ({ id }: LocaleSwitcherProps) => {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLocaleChange = (newLocale: Locale) => {
    const params = searchParams.toString();
    const targetPath = params ? `\${pathname}?\${params}` : pathname;
    router.replace(targetPath, { locale: newLocale });
  };

  const layoutId = id ? `\${id}-locale-indicator` : "locale-indicator";

  return (
    <div className="flex gap-2 font-mono text-[10px] tracking-widest uppercase text-white/40">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => handleLocaleChange(l)}
          className={`px-2 py-1 transition-colors relative \${
            locale === l ? "text-ember" : "hover:text-white"
          }`}
        >
          {l}
          {locale === l && (
            <motion.div
              layoutId={layoutId}
              className="absolute -bottom-1 left-0 right-0 h-[1px] bg-ember"
            />
          )}
        </button>
      ))}
    </div>
  );
};

export const LocaleSwitcher = (props: LocaleSwitcherProps) => (
  <Suspense fallback={null}>
    <LocaleSwitcherContent {...props} />
  </Suspense>
);
