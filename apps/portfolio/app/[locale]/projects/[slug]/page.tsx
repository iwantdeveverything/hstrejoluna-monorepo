import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { safeJsonLd } from "@/lib/safe-json-ld";
import { client, urlFor } from "@/lib/sanity";
import { Project, PortableTextBlock } from "@/types/sanity";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PortableText } from "@portabletext/react";
import { blockToPlainText, slugify, extractTextFromReactNode, DEFAULT_BASE_URL } from "@/lib/utils";
import { TelemetryHUD, LiquidGlass } from "@hstrejoluna/ui";
import { AUTHOR_NAME, SITE_NAME } from "@/constants/brand";



const isValidYear = (year?: string | null): boolean => {
  return typeof year === 'string' && /^\d{4}$/.test(year);
};

const portableTextComponents = {
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => {
      const text = extractTextFromReactNode(children);
      return <h2 id={slugify(text)}>{children}</h2>;
    },
    h3: ({ children }: { children?: React.ReactNode }) => {
      const text = extractTextFromReactNode(children);
      return <h3 id={slugify(text)}>{children}</h3>;
    },
    h4: ({ children }: { children?: React.ReactNode }) => {
      const text = extractTextFromReactNode(children);
      return <h4 id={slugify(text)}>{children}</h4>;
    },
  },
  marks: {
    link: ({ children, value }: { children?: React.ReactNode; value?: { href?: string } }) => {
      let href = value?.href ?? "#";
      const isExternal = href.startsWith("http");

      const safeProtocols = ["http:", "https:", "mailto:", "tel:"];
      try {
        const urlObj = new URL(href, href.startsWith("/") ? DEFAULT_BASE_URL : undefined);
        if (!safeProtocols.includes(urlObj.protocol)) {
          href = "#";
        }
      } catch (e) {
        href = "#";
      }

      return (
        <a
          href={href}
          {...(isExternal && {
            target: "_blank",
            rel: "noopener noreferrer",
          })}
        >
          {children}
        </a>
      );
    },
  },
};

interface ProjectPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const projectQuery = `*[_type == "project" && slug.current == $slug][0] {
  ...,
  techStack[]->
}`;

const allSlugsQuery = `*[_type == "project" && defined(slug.current)].slug.current`;

const getProject = cache(async (slug: string): Promise<Project | null> => {
  return client.fetch<Project | null>(projectQuery, { slug });
});

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<string[]>(allSlugsQuery);
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProject(slug);
  const tCommon = await getTranslations({ locale, namespace: "common" });

  if (!project) return {};

  const descriptionRaw =
    project.shortDescription && project.shortDescription.length > 0
      ? project.shortDescription
      : blockToPlainText(project.description);
  const description =
    descriptionRaw.length > 160
      ? descriptionRaw.slice(0, 157) + "..."
      : descriptionRaw;
  const name = tCommon("fullName") || AUTHOR_NAME;



  return {
    title: project.title,
    description,
    keywords: project.seoKeywords,
    openGraph: {
      title: project.title,
      description,
      type: "article",
      siteName: SITE_NAME,
      publishedTime: isValidYear(project.year) ? `${project.year}-01-01` : undefined,
      authors: [name],
      images: project.image
        ? [
            {
              url: urlFor(project.image).width(1200).height(630).url(),
              width: 1200,
              height: 630,
              alt: project.image.alt || project.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: project.image
        ? [urlFor(project.image).width(1200).height(630).url()]
        : [],
    },
    alternates: {
      canonical: `${DEFAULT_BASE_URL}/${locale}/projects/${slug}`,
      languages: {
        en: `${DEFAULT_BASE_URL}/en/projects/${slug}`,
        es: `${DEFAULT_BASE_URL}/es/projects/${slug}`,
      },
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [project, t, tCommon] = await Promise.all([
    getProject(slug),
    getTranslations({ locale, namespace: "fragments.project" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  if (!project) {
    notFound();
  }

  const authorName = tCommon("fullName") || AUTHOR_NAME;



  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["SoftwareSourceCode", "CreativeWork"],
    name: project.title,
    description:
      project.shortDescription && project.shortDescription.length > 0
        ? project.shortDescription
        : blockToPlainText(project.description),
    image: project.image
      ? urlFor(project.image).width(1200).height(630).url()
      : undefined,
    thumbnailUrl: project.image
      ? urlFor(project.image).width(400).height(225).url()
      : undefined,
    genre: "Software Development",
    author: {
      "@type": "Person",
      name: authorName,
      url: DEFAULT_BASE_URL,
    },
    datePublished: isValidYear(project.year) ? `${project.year}-01-01` : undefined,
    programmingLanguage: project.techStack?.filter(Boolean).map((s) => s.name),
    codeRepository: project.externalLink?.includes("github.com")
      ? project.externalLink
      : undefined,
    url: project.externalLink || `${DEFAULT_BASE_URL}/${locale}/projects/${project.slug?.current}`,
    keywords: project.seoKeywords,
  };

  const breadcrumbs = [
    { label: t("home"), href: "/" },
    { label: t("projects"), href: "/#projects" },
    { label: project.title, isCurrent: true },
  ];

  const renderContent = (
    content: PortableTextBlock[] | undefined,
    description: string | PortableTextBlock[] | undefined,
  ): PortableTextBlock[] => {
    if (Array.isArray(content)) return content;
    if (Array.isArray(description)) return description;
    return [];
  };

  return (
    <article className="min-h-screen bg-background text-white pt-32 pb-24 px-4 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={breadcrumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
          <header className="lg:col-span-12">
            <TelemetryHUD
              identifier={project.slug?.current || "PROJECT_UPLINK"}
              status="STABLE"
              techStack={
                project.techStack?.filter(Boolean).map((s) => s.name) || []
              }
              className="mb-8"
            />
            <h1 className="text-4xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-8">
              {project.title}
            </h1>

            <div className="flex flex-wrap gap-12 border-y border-white/10 py-8 text-label-sm font-mono uppercase tracking-[0.2em] text-on_surface_variant">
              {project.role && (
                <div>
                  <span className="block opacity-40 mb-2">{t("role")}</span>
                  <span className="text-white font-bold">{project.role}</span>
                </div>
              )}
              {project.year && (
                <div>
                  <span className="block opacity-40 mb-2">{t("year")}</span>
                  <span className="text-white font-bold">{project.year}</span>
                </div>
              )}
              {project.externalLink && (
                <div>
                  <span className="block opacity-40 mb-2">
                    {project.externalLink.includes("github.com")
                      ? t("viewGitHub")
                      : t("visitSite")}
                  </span>
                  <a
                    href={project.externalLink}
                    target="_blank"
                    rel="noopener noreferrer external"
                    className="text-primary font-bold hover:text-white transition-colors"
                  >
                    {project.externalLink
                      .replace(/^https?:\/\//, "")
                      .replace(/\/$/, "")}{" "}
                    ↗
                  </a>
                </div>
              )}
            </div>
          </header>

          <section className="lg:col-span-8 space-y-12">
            {project.image && (
              <LiquidGlass
                variant="panel"
                className="relative aspect-[16/9] w-full overflow-hidden border border-white/5 grayscale hover:grayscale-0 transition-all duration-700 group"
              >
                <Image
                  src={urlFor(project.image).url()}
                  alt={project.image.alt || project.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
              </LiquidGlass>
            )}

            <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-p:text-on_surface_variant prose-p:font-light prose-strong:text-white prose-a:text-primary">
              <PortableText
                value={renderContent(project.content, project.description)}
                components={portableTextComponents}
              />
            </div>

            {project.gallery && project.gallery.length > 0 && (
              <div className="space-y-8">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                  {t("gallery")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.gallery.map((img, idx) => (
                    <LiquidGlass
                      key={img.asset?._ref ?? String(idx)}
                      variant="panel"
                      className="relative aspect-video overflow-hidden border border-white/5 grayscale hover:grayscale-0 transition-all duration-500 group"
                    >
                      <Image
                        src={urlFor(img).url()}
                        alt={img.alt || `${project.title} gallery ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </LiquidGlass>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="lg:col-span-4 space-y-12">
            <LiquidGlass variant="panel" className="p-8 border border-white/5">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6">
                {t("techStack")}
              </h3>
              <div className="flex flex-wrap gap-3">
                {project.techStack?.filter(Boolean).map((skill) => (
                  <LiquidGlass
                    as="span"
                    variant="pill"
                    intensity="low"
                    key={skill._id}
                    className="px-3 py-1 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-on_surface_variant"
                  >
                    {skill.name}
                  </LiquidGlass>
                ))}
              </div>
            </LiquidGlass>
          </aside>
        </div>
      </div>
    </article>
  );
}
