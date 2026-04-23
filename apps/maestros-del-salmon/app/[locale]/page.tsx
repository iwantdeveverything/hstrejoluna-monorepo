"use client";

import { useTranslations } from "next-intl";
import { event } from "@/lib/fpixel";
import { whatsappLink } from "@/constants/contact";

export default function LandingPage() {
  const t = useTranslations("salmon");

  const handlePurchaseClick = () => {
    event("Lead", { content_name: t("hero.cta_buy"), currency: "MXN" });
    console.info("Initiating purchase flow...");
  };

  const handleWhatsAppClick = () => {
    event("Contact", { method: "WhatsApp" });
    window.open(whatsappLink, "_blank");
  };

  return (
    <>
      <header className="w-full bg-brand-marine text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wider">
            Maestros del <span className="text-brand-salmon">Salmón</span>
          </h1>
          <nav>
            <button
              onClick={handleWhatsAppClick}
              className="text-sm border border-brand-salmon text-brand-salmon px-4 py-2 rounded-full hover:bg-brand-salmon hover:text-white transition-colors"
              aria-label={t("header.contact_aria")}
            >
              {t("header.contact_label")}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-brand-marineLight text-white py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              {t("hero.title")}
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-10">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={handlePurchaseClick}
                className="bg-brand-salmon hover:bg-brand-salmonDark text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                aria-label={t("hero.cta_buy")}
              >
                {t("hero.cta_buy")}
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="bg-transparent border-2 border-white hover:border-brand-salmon hover:text-brand-salmon text-white font-bold py-4 px-8 rounded-lg transition-colors"
                aria-label={t("hero.cta_sales")}
              >
                {t("hero.cta_sales")}
              </button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white px-4">
          <div className="container mx-auto max-w-5xl">
            <h3 className="text-3xl font-bold text-center text-brand-marine mb-12">
              {t("guarantee.title")}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-brand-sand p-8 rounded-xl shadow-sm text-center flex flex-col items-center">
                <div className="h-16 w-16 bg-brand-salmon rounded-full flex items-center justify-center mb-6 text-white text-xl font-bold">
                  BAP
                </div>
                <h4 className="text-xl font-bold text-brand-marine mb-3">{t("guarantee.bap_title")}</h4>
                <p className="text-gray-600">
                  {t("guarantee.bap_desc")}
                </p>
              </div>

              <div className="bg-brand-sand p-8 rounded-xl shadow-sm text-center flex flex-col items-center">
                <div className="h-16 w-16 bg-brand-marineLight rounded-full flex items-center justify-center mb-6 text-white text-xl font-bold">
                  K
                </div>
                <h4 className="text-xl font-bold text-brand-marine mb-3">{t("guarantee.kosher_title")}</h4>
                <p className="text-gray-600">
                  {t("guarantee.kosher_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-brand-salmon bg-opacity-10 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h3 className="text-3xl font-bold text-brand-marine mb-6">
              {t("cta_section.title")}
            </h3>
            <p className="text-lg text-gray-700 mb-8">
              {t("cta_section.desc")}
            </p>
            <button
              onClick={handlePurchaseClick}
              className="bg-brand-marine hover:bg-brand-marineLight text-white font-bold py-4 px-10 rounded-lg shadow-xl transition-all"
              aria-label={t("cta_section.button")}
            >
              {t("cta_section.button")}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
