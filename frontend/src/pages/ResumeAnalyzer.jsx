import { useState } from "react";
import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import SectionHeader from "../components/common/SectionHeader";
import ResumeUpload from "../components/resume/ResumeUpload";
import AnalysisDashboard from "../components/resume/AnalysisDashboard";
import ResumeBuilderForm from "../components/resume/ResumeBuilderForm";
import ResumeResult from "../components/resume/ResumeResult";
import Icon from "../components/ui/Icon";
import { analyzeResume, analyzeSampleResume, generateResume, rebuildResume } from "../utils/resumeApi";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

export default function ResumeAnalyzer() {
  const [mode, setMode] = useState("analyze");
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [analysisData, setAnalysisData] = useState(null);
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");

  const description = "Analyze a PDF resume, identify ATS improvements, rebuild it into a clean format, or create an ATS-ready resume from scratch with Rapido Solutions.";
  usePageMeta("AI Resume Analyzer & ATS Resume Builder | Rapido", description, { absoluteTitle: true, canonicalPath: "/resume-analyzer" });

  const run = async (label, requestAction) => {
    setError("");
    setPending(label);
    try {
      return await requestAction();
    } catch (requestError) {
      setError(requestError.message || "The request could not be completed.");
      return null;
    } finally {
      setPending("");
    }
  };

  const handleAnalysis = async (sample = false) => {
    setAnalysisData(null);
    setResult(null);
    const data = await run("analyze", () => sample ? analyzeSampleResume(targetRole) : analyzeResume(file, targetRole));
    if (data) setAnalysisData(data);
  };

  const handleRebuild = async () => {
    const data = await run("rebuild", () => rebuildResume({ resumeText: analysisData.resumeText, targetRole, analysis: analysisData.analysis }));
    if (data) setResult(data);
  };

  const handleGenerate = async (profile) => {
    setResult(null);
    const data = await run("generate", () => generateResume(profile));
    if (data) setResult(data);
  };

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="AI Resume Workspace"
        title="Analyze, Improve, or Build an ATS Resume"
        description="Get a strict resume review, rebuild an existing PDF, or create a clean ATS-friendly resume from your career details."
      >
        <div className="flex max-w-xl items-center gap-3 rounded-lg border border-white/15 bg-white/[0.08] p-3 text-sm leading-6 text-blue-100">
          <Icon name="FiShield" className="h-5 w-5 shrink-0 text-rapido-cyan" />
          Resume content is processed for this request and is not saved by Rapido.
        </div>
      </PageHero>

      <section className="section-padding bg-rapido-mist">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Resume Tools"
            title="Choose How You Want to Begin"
            description="Review an existing resume or build a new one from structured career information."
          />

          <div className="mx-auto mb-7 grid max-w-2xl grid-cols-2 rounded-lg border border-rapido-line bg-white p-1.5 shadow-sm" role="tablist" aria-label="Resume workflow">
            <button className={`min-h-12 rounded-lg px-3 text-sm font-extrabold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rapido-blue ${mode === "analyze" ? "bg-rapido-blue text-white" : "text-rapido-slate hover:bg-rapido-mist"}`} type="button" role="tab" aria-selected={mode === "analyze"} onClick={() => { setMode("analyze"); setResult(null); setError(""); }}>
              Analyze & Rebuild
            </button>
            <button className={`min-h-12 rounded-lg px-3 text-sm font-extrabold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rapido-blue ${mode === "build" ? "bg-rapido-blue text-white" : "text-rapido-slate hover:bg-rapido-mist"}`} type="button" role="tab" aria-selected={mode === "build"} onClick={() => { setMode("build"); setResult(null); setError(""); }}>
              Create From Scratch
            </button>
          </div>

          {error ? <div className="mx-auto mb-6 flex max-w-4xl items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800" role="alert"><Icon name="FiAlertCircle" className="mt-0.5 h-5 w-5 shrink-0" />{error}</div> : null}

          <div className="mx-auto max-w-5xl">
            {mode === "analyze" ? (
              <>
                <label className="mb-5 block text-sm font-bold text-rapido-navy">Target role <span className="font-medium text-rapido-slate">(optional)</span>
                  <input className="mt-2 min-h-12 w-full rounded-lg border border-rapido-line bg-white px-4 outline-none transition focus:border-rapido-blue focus:ring-2 focus:ring-blue-100" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. Senior Frontend Engineer" maxLength={160} />
                </label>
                <ResumeUpload file={file} onFileChange={(nextFile) => { setFile(nextFile); setAnalysisData(null); setResult(null); }} onAnalyze={() => handleAnalysis(false)} onSample={() => handleAnalysis(true)} pending={pending === "analyze"} />
                {analysisData ? <AnalysisDashboard analysis={analysisData.analysis} onRebuild={handleRebuild} rebuilding={pending === "rebuild"} /> : null}
              </>
            ) : <ResumeBuilderForm onGenerate={handleGenerate} pending={pending === "generate"} />}
            {result ? <ResumeResult result={result} /> : null}
          </div>
        </div>
      </section>
    </motion.main>
  );
}
