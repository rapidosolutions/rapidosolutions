import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const routeMetadata = {
  "/": {
    title: "Web, Bookkeeping & HR Services | Rapido Solutions",
    description:
      "Rapido Solutions Co. provides web development, Shopify, WordPress, SEO, bookkeeping, property accounting, and HR support for growing businesses."
  },
  "/about": {
    title: "About Rapido Solutions | Web, Finance & HR Team",
    description:
      "Learn how Rapido Solutions Co. brings together web development, SEO, bookkeeping, finance, and HR expertise for growing businesses."
  },
  "/web-services": {
    title: "Web Development, Shopify & SEO Services | Rapido",
    description:
      "Explore responsive web development, Shopify, WordPress, technical SEO, UI/UX, and website maintenance services from Rapido Solutions Co."
  },
  "/financial-services": {
    title: "Bookkeeping & Finance Support Services | Rapido Solutions",
    description:
      "Get bookkeeping, accounts payable, reconciliations, reporting, payroll coordination, compliance, and property accounting support from Rapido Solutions Co."
  },
  "/human-resource-services": {
    title: "Human Resource Services for Growing Teams | Rapido",
    description:
      "Strengthen hiring, HR policies, SOPs, onboarding, training, and employee development with practical human resource support from Rapido Solutions Co."
  },
  "/projects": {
    title: "Web, Finance & HR Project Examples | Rapido Solutions",
    description:
      "Explore web, Shopify, WordPress, SEO, bookkeeping, finance, and HR project examples that show the service directions Rapido Solutions Co. can deliver."
  },
  "/blogs": {
    title: "Web, Finance & HR Insights | Rapido Solutions Blog",
    description:
      "Read practical Rapido Solutions Co. articles about web development, Shopify, WordPress, SEO, bookkeeping, finance, HR, and business operations."
  },
  "/contact": {
    title: "Contact Rapido Solutions | Web, Finance & HR Support",
    description:
      "Contact Rapido Solutions Co. about web development, Shopify, WordPress, SEO, bookkeeping, finance, or human resource support for your business."
  },
  "/reviews": {
    title: "Reviews | Rapido Solutions Co.",
    description: "Review and share feedback about working with Rapido Solutions Co.",
    robots: "noindex, follow"
  },
  "/resume-analyzer": {
    title: "AI Resume Analyzer & ATS Resume Builder | Rapido",
    description:
      "Analyze a PDF resume, identify ATS improvements, rebuild it into a clean format, or create an ATS-ready resume from scratch with Rapido Solutions."
  },
  "/blog-admin": {
    title: "Blog Admin | Rapido Solutions Co.",
    description: "Securely manage Rapido blog posts and customer enquiries.",
    robots: "noindex, nofollow"
  },
  "/project-admin": {
    title: "Project Admin | Rapido Solutions Co.",
    description: "Securely manage Rapido project content.",
    robots: "noindex, nofollow"
  },
  "/system-x7k2": {
    title: "CV Admin",
    description: "Private CV administration console.",
    robots: "noindex, nofollow"
  }
};

const publicRoutes = Object.entries(routeMetadata)
  .filter(([, metadata]) => !metadata.robots?.includes("noindex"))
  .map(([route]) => route);

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function renderRouteHtml(html, siteUrl, route, metadata) {
  const canonicalUrl = new URL(route, `${siteUrl}/`).href;
  const title = escapeAttribute(metadata.title);
  const description = escapeAttribute(metadata.description);
  let output = html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/, `$1${description}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/>)/, `$1${title}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/>)/, `$1${description}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/>)/, `$1${canonicalUrl}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/>)/, `$1${title}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/>)/, `$1${description}$2`)
    .replace(/(<meta\s+name="robots"\s+content=")[^"]*("\s*\/>)/, `$1${metadata.robots || "index, follow"}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/>)/, `$1${canonicalUrl}$2`);

  return output;
}

function createSeoAssets(siteUrl) {
  const robots = `User-agent: *\nAllow: /\nDisallow: /blog-admin\nDisallow: /project-admin\nDisallow: /system-x7k2\nDisallow: /system-x7k2/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicRoutes
    .map((route) => `  <url><loc>${new URL(route, `${siteUrl}/`).href}</loc></url>`)
    .join("\n")}\n</urlset>\n`;

  return {
    name: "rapido-seo-assets",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url === "/robots.txt") {
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
          response.end(robots);
          return;
        }
        if (request.url === "/sitemap.xml") {
          response.setHeader("Content-Type", "application/xml; charset=utf-8");
          response.end(sitemap);
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
    },
    writeBundle(options) {
      const outputDirectory = options.dir || path.join(__dirname, "dist");
      const indexHtml = readFileSync(path.join(outputDirectory, "index.html"), "utf8");
      Object.entries(routeMetadata).forEach(([route, metadata]) => {
        if (route === "/") return;
        writeFileSync(
          path.join(outputDirectory, `${route.slice(1)}.html`),
          renderRouteHtml(indexHtml, siteUrl, route, metadata)
        );
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const siteUrl = (env.VITE_SITE_URL || "https://rapidosolutions.vercel.app").replace(/\/$/, "");

  return {
    root: __dirname,
    plugins: [
      react(),
      createSeoAssets(siteUrl),
      {
        name: "rapido-site-url",
        transformIndexHtml(html) {
          return html.replaceAll("__SITE_URL__", siteUrl);
        }
      }
    ],
    server: {
      proxy: {
        "/api": "http://localhost:4174"
      }
    },
    build: {
      outDir: "dist",
      emptyOutDir: true
    }
  };
});
