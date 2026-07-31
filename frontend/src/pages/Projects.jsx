import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import PageHero from "../components/common/PageHero";
import SectionHeader from "../components/common/SectionHeader";
import PortfolioCard from "../components/portfolio/PortfolioCard";
import PortfolioFilter from "../components/portfolio/PortfolioFilter";
import HomeCTA from "../components/home/HomeCTA";
import Button from "../components/common/Button";
import { projectCategories, projects } from "../data/portfolioData";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";
import { createBreadcrumbSchema, createWebPageSchema } from "../utils/seo";
import { useStructuredData } from "../utils/useStructuredData";

export default function Projects() {
  const [active, setActive] = useState("All");
  const [searchParams] = useSearchParams();
  const projectType = searchParams.get("type");
  const normalizedType =
    projectType === "financial" ? "financial" : projectType === "human" ? "human" : projectType === "web" ? "web" : "all";

  useEffect(() => {
    setActive("All");
  }, [normalizedType]);

  const description =
    "Explore web, Shopify, WordPress, SEO, bookkeeping, finance, and HR project examples that show the service directions Rapido Solutions Co. can deliver.";
  usePageMeta("Web, Finance & HR Project Examples | Rapido Solutions", description, {
    absoluteTitle: true,
    canonicalPath: "/projects"
  });
  useStructuredData(
    "projects-page",
    createWebPageSchema({ name: "Web, Finance and HR Project Examples", description, path: "/projects", type: "CollectionPage" })
  );
  useStructuredData(
    "projects-breadcrumbs",
    createBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }])
  );

  const visibleProjects = useMemo(
    () =>
      projects.filter((project) => {
        const matchesType = normalizedType === "all" || project.type === normalizedType;
        const matchesCategory = active === "All" || project.category === active;
        return matchesType && matchesCategory;
      }),
    [active, normalizedType]
  );

  const filterDescription =
    normalizedType === "financial"
      ? "Financial project examples for bookkeeping, property accounting, reconciliations, and reporting support."
      : normalizedType === "human"
        ? "Human resource project examples for talent acquisition, HR policies, SOPs, training, and development support."
      : normalizedType === "web"
        ? "Web project examples for websites, Shopify, WordPress, SEO, UX, and performance work."
        : "Use the filters to explore sample directions by business type and service focus.";

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="Projects"
        title="Web, Finance and HR Project Examples"
        description="Explore practical project concepts for web builds, SEO improvements, financial workflows, and human resource support."
      >
        <Button to="/contact">Start a Similar Project</Button>
      </PageHero>

      <section className="section-padding bg-white">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Browse Projects"
            title="Project Styles Built Around Real Business Needs"
            description={filterDescription}
          />
          <PortfolioFilter
            categories={
              normalizedType === "financial"
                ? ["All", "Financial Projects"]
                : normalizedType === "human"
                  ? ["All", "Human Resource Projects"]
                : normalizedType === "web"
                  ? projectCategories.filter((category) => !["Financial Projects", "Human Resource Projects"].includes(category))
                  : projectCategories
            }
            active={active}
            onChange={setActive}
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project, index) => (
              <PortfolioCard key={project.title} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      <HomeCTA />
    </motion.main>
  );
}
