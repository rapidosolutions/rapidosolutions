import { projects } from "../../data/portfolioData";
import SectionHeader from "../common/SectionHeader";
import PortfolioCard from "../portfolio/PortfolioCard";

export default function WorkShowcase() {
  return (
    <section className="section-padding bg-white">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Projects"
          title="Selected Project Directions"
          description="A simple view of project types Rapido can deliver for stores, restaurants, real estate teams, SaaS products, and service businesses."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 6).map((project, index) => (
            <PortfolioCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
