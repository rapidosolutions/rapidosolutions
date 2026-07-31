import { useEffect } from "react";
import { absoluteUrl } from "./seo";

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

function removeMeta(selector) {
  document.head.querySelector(selector)?.remove();
}

export function usePageMeta(title, description, options = {}) {
  useEffect(() => {
    const resolvedTitle = options.absoluteTitle ? title : `${title} | Rapido Solutions Co.`;
    const canonicalUrl = absoluteUrl(options.canonicalPath || window.location.pathname);
    const socialTitle = options.ogTitle || resolvedTitle;
    const socialDescription = options.ogDescription || description;

    document.title = resolvedTitle;
    setMeta("meta[name='description']", { name: "description", content: description });
    setMeta("meta[name='robots']", { name: "robots", content: options.robots || "index, follow" });
    setMeta("meta[property='og:type']", { property: "og:type", content: options.ogType || "website" });
    setMeta("meta[property='og:locale']", { property: "og:locale", content: "en_US" });
    setMeta("meta[property='og:site_name']", { property: "og:site_name", content: "Rapido Solutions Co." });
    setMeta("meta[property='og:title']", { property: "og:title", content: socialTitle });
    setMeta("meta[property='og:description']", { property: "og:description", content: socialDescription });
    setMeta("meta[property='og:url']", { property: "og:url", content: canonicalUrl });
    setMeta("meta[name='twitter:card']", { name: "twitter:card", content: options.image ? "summary_large_image" : "summary" });
    setMeta("meta[name='twitter:title']", { name: "twitter:title", content: socialTitle });
    setMeta("meta[name='twitter:description']", { name: "twitter:description", content: socialDescription });

    if (options.image) {
      const imageUrl = options.image.startsWith("http") ? options.image : absoluteUrl(options.image);
      setMeta("meta[property='og:image']", { property: "og:image", content: imageUrl });
      setMeta("meta[name='twitter:image']", { name: "twitter:image", content: imageUrl });
    } else {
      removeMeta("meta[property='og:image']");
      removeMeta("meta[name='twitter:image']");
    }

    [
      ["meta[property='article:published_time']", "article:published_time", options.publishedTime],
      ["meta[property='article:modified_time']", "article:modified_time", options.modifiedTime],
      ["meta[property='article:author']", "article:author", options.author]
    ].forEach(([selector, property, value]) => {
      if (value) setMeta(selector, { property, content: value });
      else removeMeta(selector);
    });

    let canonical = document.head.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);
  }, [
    description,
    options.absoluteTitle,
    options.author,
    options.canonicalPath,
    options.image,
    options.modifiedTime,
    options.ogDescription,
    options.ogTitle,
    options.ogType,
    options.publishedTime,
    options.robots,
    title
  ]);
}
