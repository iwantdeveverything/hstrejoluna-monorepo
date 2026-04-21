import React from "react";
import Link from "next/link";
import { Copyleft } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-50 mt-20 border-t border-white/10 bg-black/50 py-8 backdrop-blur-sm sm:mt-32">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-8 lg:px-12">
        
        {/* Anti-copyright / Brand */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Copyleft className="h-4 w-4" aria-hidden="true" />
          <span>{currentYear} Dark Kinetic. Free to fork.</span>
        </div>

        {/* Legal Navigation */}
        <nav aria-label="Legal Navigation" className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-400">
          <Link href="/privacy" className="transition-colors hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black">
            Privacy Policy
          </Link>
          <Link href="/cookies" className="transition-colors hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black">
            Cookie Policy
          </Link>
        </nav>
        
      </div>
    </footer>
  );
}
