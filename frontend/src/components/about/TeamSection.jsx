import { teamMembers } from "../../data/teamData";
import SectionHeader from "../common/SectionHeader";
import TeamCard from "../team/TeamCard";

export default function TeamSection() {
  return (
    <section id="team" className="section-padding bg-white">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Team"
          title="A Focused Team for Web and Financial Support"
          description="Meet the people behind Rapido's website, digital growth, and finance support work."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <TeamCard key={member.name} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
