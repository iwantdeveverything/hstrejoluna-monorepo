"use client";

import { Link as LocalizedLink } from "@/i18n/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-label-sm font-mono uppercase tracking-widest">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <span className="text-on_surface_variant/40" aria-hidden="true">/</span>}
            
            {item.isCurrent || !item.href ? (
              <span className="text-primary font-bold" aria-current="page">
                {item.label}
              </span>
            ) : (
              <LocalizedLink
                href={item.href}
                className="text-on_surface_variant hover:text-white transition-colors"
              >
                {item.label}
              </LocalizedLink>
            )}
          </li>
        ))}
      </ol>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.label,
              ...(item.href && { "item": `${process.env.NEXT_PUBLIC_BASE_URL || ""}${item.href}` }),
            })),
          }),
        }}
      />
    </nav>
  );
};
