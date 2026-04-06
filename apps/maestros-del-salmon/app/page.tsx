"use client";

import { event } from "@/lib/fpixel";
import { whatsappLink } from "@/constants/contact";

export default function LandingPage() {
  const handlePurchaseClick = () => {
    event("Lead", { content_name: "Comprar Salmón", currency: "MXN" });
    // In production, this would open a checkout modal or redirect to a payment platform
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
              aria-label="Contactar por WhatsApp"
            >
              Atención a Chefs y B2B
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-brand-marineLight text-white py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              El Salmón de la Alta Cocina, Directo a tu Mesa.
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-10">
              Manejamos calidad premium para los paladares más exigentes en Cancún. Exclusiva <strong className="text-brand-salmon font-semibold">Doble Garantía</strong> certificada.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={handlePurchaseClick}
                className="bg-brand-salmon hover:bg-brand-salmonDark text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                aria-label="Comprar Salmón Premium ahora"
              >
                Hacer mi Primer Pedido
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="bg-transparent border-2 border-white hover:border-brand-salmon hover:text-brand-salmon text-white font-bold py-4 px-8 rounded-lg transition-colors"
                aria-label="Contactar a ventas corporativas por WhatsApp"
              >
                Ventas Corporativas
              </button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white px-4">
          <div className="container mx-auto max-w-5xl">
            <h3 className="text-3xl font-bold text-center text-brand-marine mb-12">
              Nuestra Inigualable Doble Garantía
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-brand-sand p-8 rounded-xl shadow-sm text-center flex flex-col items-center">
                <div className="h-16 w-16 bg-brand-salmon rounded-full flex items-center justify-center mb-6 text-white text-xl font-bold">
                  BAP
                </div>
                <h4 className="text-xl font-bold text-brand-marine mb-3">Certificación BAP 4-Estrellas</h4>
                <p className="text-gray-600">
                  Aseguramos las mejores prácticas globales en acuicultura. Nuestra promesa es sostenibilidad, responsabilidad integral y óptima seguridad alimentaria.
                </p>
              </div>

              <div className="bg-brand-sand p-8 rounded-xl shadow-sm text-center flex flex-col items-center">
                <div className="h-16 w-16 bg-brand-marineLight rounded-full flex items-center justify-center mb-6 text-white text-xl font-bold">
                  K
                </div>
                <h4 className="text-xl font-bold text-brand-marine mb-3">Certificación Kosher</h4>
                <p className="text-gray-600">
                  Cumplimos de manera estricta con rigurosos estándares de supervisión, garantizando excelencia y tranquilidad al más alto nivel culinario.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-brand-salmon bg-opacity-10 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h3 className="text-3xl font-bold text-brand-marine mb-6">
              ¿Listo para elevar el estándar de tu cocina?
            </h3>
            <p className="text-lg text-gray-700 mb-8">
              Realiza tu pedido y recíbelo fresco y en óptimas condiciones en Cancún por medio de nuestra logística garantizada en cadena de frío.
            </p>
            <button
              onClick={handlePurchaseClick}
              className="bg-brand-marine hover:bg-brand-marineLight text-white font-bold py-4 px-10 rounded-lg shadow-xl transition-all"
              aria-label="Iniciar proceso de pedido de salmón"
            >
              Comprar Salmón Ahora
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-brand-marine text-sm text-gray-400 py-8 px-4 text-center border-t border-brand-marineLight">
        <div className="container mx-auto">
          <p className="mb-2">&copy; {new Date().getFullYear()} Maestros del Salmón. Todos los derechos reservados.</p>
          <p>La opción #1 para Alta Cocina en Cancún y la Riviera Maya.</p>
        </div>
      </footer>
    </>
  );
}
