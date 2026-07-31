import Button from "../common/Button";
import Icon from "../ui/Icon";

const groups = [
  { key: "strengths", title: "Strengths", icon: "FiCheckCircle", color: "text-emerald-700", surface: "bg-emerald-50" },
  { key: "weaknesses", title: "Weaknesses", icon: "FiAlertCircle", color: "text-amber-700", surface: "bg-amber-50" },
  { key: "missingKeywords", title: "Keyword Opportunities", icon: "FiTarget", color: "text-rapido-blue", surface: "bg-blue-50" },
  { key: "actionSteps", title: "Recommended Actions", icon: "FiTrendingUp", color: "text-cyan-700", surface: "bg-cyan-50" }
];

export default function AnalysisDashboard({ analysis, onRebuild, rebuilding }) {
  const score = Math.max(0, Math.min(10, Number(analysis.score) || 0));

  return (
    <section className="mt-8" aria-labelledby="resume-analysis-heading">
      <div className="rounded-lg bg-rapido-navy p-5 text-white shadow-glass sm:p-7">
        <div className="grid items-center gap-6 md:grid-cols-[180px_1fr]">
          <div className="mx-auto grid h-36 w-36 place-items-center rounded-full p-3" style={{ background: `conic-gradient(#35b5ff ${score * 10}%, rgba(255,255,255,.12) 0)` }} aria-label={`ATS score ${score} out of 10`}>
            <div className="grid h-full w-full place-items-center rounded-full bg-rapido-navy text-center">
              <span><strong className="block font-display text-4xl">{score}</strong><span className="text-xs font-bold uppercase tracking-[0.12em] text-blue-200">out of 10</span></span>
            </div>
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-rapido-cyan">ATS Readiness</span>
            <h2 id="resume-analysis-heading" className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">Your resume analysis</h2>
            <p className="mt-3 max-w-2xl leading-7 text-blue-100">{analysis.reason}</p>
            <Button className="mt-5 w-full sm:w-auto" onClick={onRebuild} disabled={rebuilding} icon="FiRefreshCw">
              {rebuilding ? "Improving Resume..." : "Rebuild for ATS"}
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <article key={group.key} className="rounded-lg border border-rapido-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${group.surface} ${group.color}`}><Icon name={group.icon} className="h-5 w-5" /></span>
              <h3 className="font-display text-lg font-extrabold text-rapido-navy">{group.title}</h3>
            </div>
            {analysis[group.key]?.length ? (
              <ul className="mt-4 space-y-3 text-sm leading-6 text-rapido-slate">
                {analysis[group.key].map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rapido-blue" />{item}</li>)}
              </ul>
            ) : <p className="mt-4 text-sm text-rapido-slate">No items identified.</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
