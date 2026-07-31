import { useState } from "react";
import Button from "../common/Button";
import Icon from "../ui/Icon";
import { exportResumePdf } from "../../utils/resumeApi";

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function ResumeResult({ result }) {
  const [pdfPending, setPdfPending] = useState(false);
  const [error, setError] = useState("");
  const fileName = "rapido-ats-resume";

  const downloadMarkdown = () => {
    downloadBlob(new Blob([result.resumeMarkdown], { type: "text/markdown;charset=utf-8" }), `${fileName}.md`);
  };

  const downloadPdf = async () => {
    setError("");
    setPdfPending(true);
    try {
      downloadBlob(await exportResumePdf(result.resumeMarkdown, fileName), `${fileName}.pdf`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPdfPending(false);
    }
  };

  return (
    <section className="mt-8 rounded-lg border border-rapido-line bg-white shadow-premium" aria-labelledby="resume-result-heading">
      <div className="flex flex-col gap-4 border-b border-rapido-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-rapido-blue">ATS Resume Ready</span>
          <h2 id="resume-result-heading" className="mt-1 font-display text-2xl font-extrabold text-rapido-navy">Best version: {result.analysis.score}/10</h2>
          <p className="mt-1 text-sm text-rapido-slate">Selected from {result.attempts} refinement {result.attempts === 1 ? "attempt" : "attempts"}.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button size="sm" variant="secondary" icon="FiDownload" onClick={downloadMarkdown}>Markdown</Button>
          <Button size="sm" icon="FiDownload" onClick={downloadPdf} disabled={pdfPending}>{pdfPending ? "Preparing..." : "PDF"}</Button>
        </div>
      </div>
      {error ? <p className="mx-5 mt-5 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700 sm:mx-7"><Icon name="FiAlertCircle" />{error}</p> : null}
      <div className="p-5 sm:p-7">
        <pre className="max-h-[680px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-rapido-mist p-5 font-sans text-sm leading-7 text-slate-800 sm:p-7">{result.resumeMarkdown}</pre>
      </div>
    </section>
  );
}
