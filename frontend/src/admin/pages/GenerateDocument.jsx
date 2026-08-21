import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { generateDocument, listCvs, listTemplates, previewDocument } from "../lib/cvAdminApi";

const templateTypes = [
  { value: "appointment_letter", label: "Appointment Letter" },
  { value: "internship_certificate", label: "Internship Certificate" },
  { value: "experience_letter", label: "Experience Letter" },
  { value: "explanation_letter", label: "Explanation Letter" }
];

export default function GenerateDocument() {
  const [searchParams] = useSearchParams();
  const previewRef = useRef(null);
  const [cvs, setCvs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [cvId, setCvId] = useState(searchParams.get("cvId") || "");
  const [useCustom, setUseCustom] = useState(false);
  const [templateType, setTemplateType] = useState("appointment_letter");
  const [custom, setCustom] = useState({
    fullName: "",
    designation: "",
    department: "",
    salary: "",
    joiningDate: "",
    date: new Date().toISOString().slice(0, 10),
    conditions: "Standard terms and conditions of appointment apply."
  });
  const [html, setHtml] = useState("");
  const [editableHtml, setEditableHtml] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    Promise.all([listCvs({ limit: 100 }), listTemplates()])
      .then(([cvData, templateData]) => {
        setCvs(cvData.items || []);
        setTemplates(templateData.templates || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.type === templateType),
    [templates, templateType]
  );

  async function buildPreview() {
    setBusy("preview");
    setError("");
    try {
      const result = await previewDocument({
        templateType,
        templateId: selectedTemplate?.id,
        cvId: useCustom ? null : cvId || null,
        custom: useCustom || !cvId ? custom : { ...custom, conditions: custom.conditions },
        conditions: custom.conditions
      });
      setHtml(result.html);
      setEditableHtml(result.html);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function savePdf() {
    if (!editableHtml) {
      setError("Build a preview first.");
      return;
    }
    setBusy("pdf");
    setError("");
    setNotice("");
    try {
      const host = document.createElement("div");
      host.innerHTML = editableHtml;
      document.body.appendChild(host);
      const pdfBlob = await html2pdf()
        .set({
          margin: 10,
          filename: `${templateType}.pdf`,
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        })
        .from(host)
        .outputPdf("blob");
      document.body.removeChild(host);

      const { document: saved } = await generateDocument({
        cvId: useCustom ? null : cvId || null,
        templateId: selectedTemplate?.id,
        templateType,
        finalContentHtml: editableHtml,
        pdfBlob
      });
      setNotice(saved.pdfUrl ? `PDF saved: ${saved.pdfUrl}` : "Document saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Generate document</h2>
        <p className="text-sm text-violet-200/70">Auto-fills from branding + CV, then lets you edit before PDF export.</p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-violet-900/60 bg-[#12081f] p-4 md:grid-cols-2">
        <label className="text-sm text-violet-100">
          Template type
          <select
            className="mt-1 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-white"
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
          >
            {templateTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-violet-100 md:mt-7">
          <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)} />
          Use custom data (no CV on file)
        </label>

        {!useCustom ? (
          <label className="text-sm text-violet-100 md:col-span-2">
            Select CV
            <select
              className="mt-1 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-white"
              value={cvId}
              onChange={(e) => setCvId(e.target.value)}
            >
              <option value="">Choose…</option>
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.fullName} — {cv.designation || "n/a"}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {["fullName", "designation", "department", "salary", "joiningDate", "date"].map((field) => (
          <label key={field} className="text-sm capitalize text-violet-100">
            {field.replace(/([A-Z])/g, " $1")}
            <input
              className="mt-1 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-white"
              value={custom[field]}
              onChange={(e) => setCustom({ ...custom, [field]: e.target.value })}
            />
          </label>
        ))}

        <label className="text-sm text-violet-100 md:col-span-2">
          Terms &amp; conditions / notes
          <textarea
            className="mt-1 min-h-28 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-white"
            value={custom.conditions}
            onChange={(e) => setCustom({ ...custom, conditions: e.target.value })}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={buildPreview}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy === "preview" ? "Building…" : "Build editable preview"}
        </button>
        <button
          type="button"
          disabled={Boolean(busy) || !editableHtml}
          onClick={savePdf}
          className="rounded-lg border border-violet-600 px-4 py-2 text-sm font-bold text-violet-100 disabled:opacity-50"
        >
          {busy === "pdf" ? "Generating…" : "Generate PDF"}
        </button>
      </div>

      {error ? <p className="text-red-300">{error}</p> : null}
      {notice ? <p className="text-emerald-300">{notice}</p> : null}

      {editableHtml ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <textarea
            className="min-h-[32rem] rounded-xl border border-violet-800 bg-[#0b0618] p-3 font-mono text-xs text-violet-50"
            value={editableHtml}
            onChange={(e) => setEditableHtml(e.target.value)}
          />
          <div
            ref={previewRef}
            className="min-h-[32rem] overflow-auto rounded-xl border border-violet-800 bg-white p-4 text-slate-900"
            dangerouslySetInnerHTML={{ __html: editableHtml || html }}
          />
        </div>
      ) : null}
    </div>
  );
}
