import { useState, useEffect, useRef } from "react";
import { usePortal } from "../PortalContext";
import ProposalSidebar from "./ProposalSidebar";
import ProposalEditor from "./ProposalEditor";
import ProposalDocumentPreview from "./ProposalDocumentPreview";
import {
  listProposals,
  saveProposal,
  deleteProposal,
  defaultSeedProposal
} from "../../utils/proposalApi";
import {
  FiPrinter,
  FiDownload,
  FiSave,
  FiCheck,
  FiEye,
  FiEdit3,
  FiColumns,
  FiRefreshCw,
  FiRotateCcw
} from "react-icons/fi";
import html2pdf from "html2pdf.js";

export default function ProposalGenerator() {
  const { isDark } = usePortal();
  const [proposals, setProposals] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [currentProposal, setCurrentProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [viewMode, setViewMode] = useState("split"); // 'split' | 'editor' | 'preview'
  const printRef = useRef(null);

  // Load proposals on mount
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await listProposals();
        setProposals(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
          setCurrentProposal(JSON.parse(JSON.stringify(data[0])));
        }
      } catch (err) {
        console.error("Error loading proposals:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // When selectedId changes
  const handleSelectProposal = (id) => {
    setSelectedId(id);
    const found = proposals.find((p) => p.id === id);
    if (found) {
      setCurrentProposal(JSON.parse(JSON.stringify(found)));
    }
  };

  // Create new blank/template proposal
  const handleCreateNew = () => {
    const newProp = {
      id: `prop-${Date.now()}`,
      title: "New Client Proposal",
      eyebrow: "BUSINESS & TECHNOLOGY PROPOSAL",
      subtitle: "Custom Web Platform | Dedicated CMS",
      status: "draft",
      companyDetails: {
        preparedBy: "Rapido Solutions Co.",
        preparedFor: "Valued Client",
        date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        upworkUrl: "https://www.upwork.com/agencies/rapidosolutions/",
        companyUrl: "https://rapidosolutions.com",
        footerReference: "Rapido Solutions Co. | Client Proposal"
      },
      sections: [
        {
          id: `sec-${Date.now()}-1`,
          number: "1",
          title: "Project Scope & Objectives",
          subtitle: "",
          contentHtml: "<p>Outline the main objectives and technical requirements for this project.</p>",
          table: null,
          image: null,
          techStack: ["react", "nodejs", "tailwind"]
        }
      ],
      terms: defaultSeedProposal.terms,
      pricing: {
        currency: "USD",
        paymentScheduleTitle: "Payment Schedule & Milestones",
        milestones: [
          { id: `ms-1`, milestone: "Project commencement", share: "50%", amount: "500" },
          { id: `ms-2`, milestone: "Final deployment and sign-off", share: "50%", amount: "500" }
        ],
        paymentDetails: defaultSeedProposal.pricing.paymentDetails,
        summaryCards: {
          customDevAmount: "1,000",
          timeline: "2 MONTHS",
          monthlyManagement: "99 / WEBSITE"
        }
      },
      acceptance: defaultSeedProposal.acceptance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProposals([newProp, ...proposals]);
    setSelectedId(newProp.id);
    setCurrentProposal(newProp);
  };

  // Duplicate an existing proposal
  const handleDuplicateProposal = (id) => {
    const target = proposals.find((p) => p.id === id);
    if (!target) return;
    const duplicated = {
      ...JSON.parse(JSON.stringify(target)),
      id: `prop-${Date.now()}`,
      title: `Copy of ${target.title || "Proposal"}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const nextList = [duplicated, ...proposals];
    setProposals(nextList);
    setSelectedId(duplicated.id);
    setCurrentProposal(duplicated);
    saveProposal(duplicated);
  };

  // Delete a proposal
  const handleDeleteProposal = async (id) => {
    await deleteProposal(id);
    const nextList = proposals.filter((p) => p.id !== id);
    setProposals(nextList);
    if (selectedId === id) {
      if (nextList.length > 0) {
        setSelectedId(nextList[0].id);
        setCurrentProposal(JSON.parse(JSON.stringify(nextList[0])));
      } else {
        setSelectedId(null);
        setCurrentProposal(null);
      }
    }
  };

  // Save current proposal
  const handleSave = async () => {
    if (!currentProposal) return;
    try {
      setSaving(true);
      const saved = await saveProposal(currentProposal);
      setProposals((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert("Error saving proposal: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset current to reference template
  const handleResetToReference = () => {
    if (!window.confirm("Reset this proposal to the sample template matching the reference images?")) return;
    const reset = JSON.parse(JSON.stringify(defaultSeedProposal));
    reset.id = currentProposal?.id || `prop-${Date.now()}`;
    setCurrentProposal(reset);
    saveProposal(reset);
  };

  // Print via window.print()
  const handlePrint = () => {
    window.print();
  };

  // Download PDF via html2pdf.js
  const handleDownloadPdf = () => {
    const el = document.querySelector(".proposal-document-root");
    if (!el) return;
    const filename = `${(currentProposal?.title || "rapido-proposal")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}.pdf`;

    const opt = {
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(el).save();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rapido-sky/20 border-t-rapido-sky" />
          <p className="text-xs font-semibold text-slate-400">Loading Proposals…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Header */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border transition-colors ${
          isDark ? "bg-[#0c182c]/90 border-white/10" : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rapido-blue/15 text-rapido-blue">
            <FiEdit3 className="text-xl" />
          </div>
          <div>
            <h2 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Proposal Generator Tool
            </h2>
            <p className="text-xs text-slate-400">
              Create and export formatted corporate proposals matching the official Rapido identity.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "split" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Split View (Editor + Live Preview)"
            >
              <FiColumns />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "editor" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Editor View Only"
            >
              <FiEdit3 />
              <span className="hidden sm:inline">Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "preview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="A4 Document Preview Only"
            >
              <FiEye />
              <span className="hidden sm:inline">A4 Preview</span>
            </button>
          </div>

          {/* Reset Template */}
          <button
            type="button"
            onClick={handleResetToReference}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
              isDark
                ? "border-white/10 bg-white/[0.04] text-slate-300 hover:text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            title="Load the reference proposal from sample images"
          >
            <FiRotateCcw />
            <span className="hidden sm:inline">Reset Sample</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold shadow-sm hover:bg-slate-900 transition"
            title="Download PDF document"
          >
            <FiDownload />
            <span>PDF</span>
          </button>

          {/* Print / Save PDF (Native) */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold shadow-xs hover:bg-slate-200 transition"
            title="Print or Save via Browser (Ctrl+P)"
          >
            <FiPrinter />
            <span>Print</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition ${
              saveSuccess ? "bg-emerald-600" : "bg-[#1D63ED] hover:bg-blue-700"
            }`}
          >
            {saveSuccess ? <FiCheck /> : <FiSave />}
            <span>{saveSuccess ? "Saved!" : saving ? "Saving…" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Sidebar + Editor/Preview */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Proposal Sidebar */}
        <ProposalSidebar
          proposals={proposals}
          selectedId={selectedId}
          onSelectProposal={handleSelectProposal}
          onCreateNew={handleCreateNew}
          onDuplicateProposal={handleDuplicateProposal}
          onDeleteProposal={handleDeleteProposal}
          isDark={isDark}
        />

        {/* Content Area */}
        {currentProposal ? (
          <div className="flex-1 w-full overflow-hidden">
            {viewMode === "split" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <div>
                  <ProposalEditor
                    proposal={currentProposal}
                    onChange={setCurrentProposal}
                    isDark={isDark}
                  />
                </div>
                <div className="overflow-x-auto pb-8">
                  <div className="scale-[0.88] xl:scale-[0.92] origin-top">
                    <ProposalDocumentPreview
                      ref={printRef}
                      proposal={currentProposal}
                    />
                  </div>
                </div>
              </div>
            )}

            {viewMode === "editor" && (
              <div className="max-w-4xl mx-auto">
                <ProposalEditor
                  proposal={currentProposal}
                  onChange={setCurrentProposal}
                  isDark={isDark}
                />
              </div>
            )}

            {viewMode === "preview" && (
              <div className="flex justify-center overflow-x-auto pb-12">
                <ProposalDocumentPreview
                  ref={printRef}
                  proposal={currentProposal}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 p-12 text-center text-slate-400">
            No proposal selected. Click <strong>New</strong> in the sidebar to create one.
          </div>
        )}
      </div>

      {/* Embedded Print Stylesheet for exact A4 rendering */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, footer, nav, aside, button, input, .proposal-sidebar, header * {
            display: none !important;
          }
          .proposal-document-root {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
          }
          .proposal-a4-page {
            page-break-after: always !important;
            break-after: page !important;
            min-height: 297mm !important;
            max-width: 210mm !important;
            width: 210mm !important;
            margin: 0 auto !important;
            padding: 18mm 18mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
          }
        }
      `}</style>
    </div>
  );
}
