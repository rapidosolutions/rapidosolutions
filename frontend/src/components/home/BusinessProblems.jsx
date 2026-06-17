import SectionHeader from "../common/SectionHeader";
import ScrollReveal from "../common/ScrollReveal";
import Icon from "../ui/Icon";

const problems = [
  ["Website looks outdated", "Modern brand presence"],
  ["Website is not generating leads", "Clearer conversion paths"],
  ["Shopify store is not converting", "Better product journey"],
  ["WordPress website is slow", "Cleaner performance structure"],
  ["Business is not ranking on Google", "SEO-ready page system"],
  ["Mobile experience is poor", "Responsive customer flow"],
  ["Landing page is not converting", "Sharper CTA hierarchy"],
  ["Financial records need better organization", "Reliable reporting support"]
];

export default function BusinessProblems() {
  return (
    <section className="section-padding overflow-hidden bg-rapido-navy text-white">
      <div className="container-shell">
        <SectionHeader
          tone="dark"
          eyebrow="Problem Aware"
          title="Your Website Should Not Just Exist. It Should Perform."
          description="Rapido looks for the gaps that stop customers from trusting, clicking, buying, ranking, booking, or understanding what to do next."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <ScrollReveal className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-6 backdrop-blur-xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-rapido-cyan">Before</p>
            <h3 className="mt-3 text-2xl font-extrabold">Disconnected digital presence</h3>
            <div className="mt-6 grid gap-3">
              {problems.slice(0, 4).map(([problem]) => (
                <div key={problem} className="flex items-center gap-3 rounded-lg bg-white/[0.08] p-4 text-blue-100">
                  <Icon name="FiX" className="h-5 w-5 text-rose-300" />
                  <span className="font-semibold">{problem}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal className="rounded-lg border border-white/[0.12] bg-white p-6 text-rapido-navy shadow-glass">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-rapido-blue">After Rapido</p>
            <h3 className="mt-3 text-2xl font-extrabold">A sharper system for growth</h3>
            <div className="mt-6 grid gap-3">
              {problems.slice(0, 4).map(([, solution]) => (
                <div key={solution} className="flex items-center gap-3 rounded-lg bg-rapido-mist p-4">
                  <Icon name="FiCheckCircle" className="h-5 w-5 text-emerald-600" />
                  <span className="font-semibold">{solution}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {problems.slice(4).map(([problem, solution], index) => (
            <ScrollReveal key={problem} delay={index * 0.04} className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-5">
              <p className="text-sm font-bold text-blue-100">{problem}</p>
              <div className="my-4 h-px bg-white/[0.12]" />
              <p className="flex items-center gap-2 font-extrabold text-white">
                <Icon name="FiArrowRight" className="h-4 w-4 text-rapido-cyan" />
                {solution}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
