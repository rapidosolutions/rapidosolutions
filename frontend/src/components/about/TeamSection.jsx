import { teamGroups } from "../../data/teamData";
import SectionHeader from "../common/SectionHeader";
import TeamCard from "../team/TeamCard";
import Icon from "../ui/Icon";

export default function TeamSection() {
  return (
    <section id="team" className="section-padding bg-white">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Team"
          title="A Focused Team for Web, Finance, and HR Support"
          description="Meet the people behind Rapido's digital growth, operations, finance, and human resource support work."
        />
        <div className="space-y-12 lg:space-y-14">
          {teamGroups.map((group, groupIndex) => (
            <section key={group.id} data-team-group={group.id} aria-labelledby={`${group.id}-team-heading`}>
              <div className="mb-5 flex items-center gap-4">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-blue-100 bg-rapido-mist text-rapido-blue"
                  aria-hidden="true"
                >
                  <Icon name={group.icon} className="h-5 w-5" />
                </span>
                <h3
                  id={`${group.id}-team-heading`}
                  data-team-group-heading="true"
                  className="text-2xl font-extrabold text-rapido-navy"
                >
                  {group.title}
                </h3>
                <span className="h-px flex-1 bg-blue-100" aria-hidden="true" />
              </div>
              <div
                className={
                  group.members.length === 1
                    ? "grid max-w-4xl gap-5"
                    : "grid gap-5 lg:grid-cols-2"
                }
              >
                {group.members.map((member, memberIndex) => (
                  <TeamCard
                    key={member.name}
                    member={member}
                    index={groupIndex * 0.08 + memberIndex * 0.04}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
