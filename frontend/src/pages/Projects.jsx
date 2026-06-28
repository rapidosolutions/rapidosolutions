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

export default function Projects() {
  const [active, setActive] = useState("All");
  const [searchParams] = useSearchParams();
  const projectType = searchParams.get("type");
  const normalizedType =
    projectType === "financial" ? "financial" : projectType === "human" ? "human" : projectType === "web" ? "web" : "all";

  useEffect(() => {
    setActive("All");
  }, [normalizedType]);

  usePageMeta(
    "Projects",
    "Explore Rapido Solutions Co. project directions for web services, financial support, human resource services, Shopify stores, WordPress websites, SEO, and business operations."
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
        title="Project Showcase and Service Directions"
        description="A clean project-ready structure for showing web builds, financial support workflows, HR service projects, SEO improvements, and business operations support."
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
