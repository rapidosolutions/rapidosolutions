export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://rapidosolutions.vercel.app").replace(/\/$/, "");

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).href;
}

export function createWebPageSchema({ name, description, path, type = "WebPage" }) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID }
  };
}

export function createBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function createServiceSchema({ name, description, path, services }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absoluteUrl(path),
    provider: { "@id": ORGANIZATION_ID },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name,
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.description || service.summary
        }
      }))
    }
  };
}

export function createBlogPostingSchema(post) {
  const path = `/blogs/${post.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    mainEntityOfPage: absoluteUrl(path),
    url: absoluteUrl(path),
    publisher: { "@id": ORGANIZATION_ID },
    author: {
      "@type": post.author === "Rapido Editorial" ? "Organization" : "Person",
      name: post.author
    }
  };

  if (post.publishedAt || post.createdAt) schema.datePublished = post.publishedAt || post.createdAt;
  if (post.updatedAt) schema.dateModified = post.updatedAt;
  if (post.coverImage?.url) schema.image = post.coverImage.url;

  return schema;
}
