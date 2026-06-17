import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import SectionHeader from "../components/common/SectionHeader";
import Button from "../components/common/Button";
import TeamCard from "../components/team/TeamCard";
import HomeCTA from "../components/home/HomeCTA";
import { teamMembers } from "../data/teamData";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

export default function Team() {
  usePageMeta(
    "Team",
    "Meet the Rapido Solutions Co. team supporting web services, software engineering, financial operations, and business growth."
  );

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="Team"
        title="Meet the People Behind Rapido Solutions Co."
        description="A focused team supporting web services, software engineering, business strategy, and financial operations for growing businesses."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/contact">Work With Our Team</Button>
          <Button to="/projects" variant="light">
            View Projects
          </Button>
        </div>
      </PageHero>

      <section className="section-padding bg-white">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Leadership & Specialists"
            title="Focused Roles. Clear Responsibility."
            description="Profiles highlight the mix of engineering, leadership, finance, and growth experience behind Rapido's client work."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {teamMembers.map((member, index) => (
              <TeamCard key={member.name} member={member} index={index} />
            ))}
          </div>
        </div>
      </section>

      <HomeCTA />
    </motion.main>
  );
}
