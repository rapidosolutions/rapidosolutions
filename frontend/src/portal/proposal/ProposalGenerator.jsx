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
  FiRotateCcw,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(88); // percentage 75 | 88 | 100
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

  // Create new blank proposal
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

  // Duplicate proposal
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

  // Delete proposal
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

  // 100% Pixel-Perfect Clean Print Window
  const handlePrint = () => {
    const printEl = document.getElementById("proposal-document-container");
    if (!printEl) return;

    // Collect all loaded stylesheets
    const styleTags = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((tag) => tag.outerHTML)
      .join("\n");

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.zIndex = "-9999";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${currentProposal?.title || "Rapido Proposal"}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
            }
            .proposal-document-root {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .proposal-a4-page {
              width: 210mm !important;
              min-height: 297mm !important;
              height: 297mm !important;
              max-width: 210mm !important;
              margin: 0 auto !important;
              padding: 16mm 18mm !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              background: #ffffff !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
            }
            .proposal-a4-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
          </style>
        </head>
        <body>
          <div class="proposal-document-root">
            ${printEl.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Trigger print after rendering
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 450);
  };

  // Download PDF via html2pdf.js
  const handleDownloadPdf = () => {
    const el = document.getElementById("proposal-document-container");
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
    <div className="w-full flex flex-col gap-4">
      {/* Top Action Header */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-colors ${
          isDark ? "bg-[#0c182c]/90 border-white/10" : "bg-white border-slate-200 shadow-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D63ED]/15 text-[#1D63ED]">
            <FiEdit3 className="text-xl" />
          </div>
          <div>
            <h2 className={`text-sm sm:text-base font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              {currentProposal?.title || "Proposal Generator"}
            </h2>
            <p className="text-[11px] text-slate-400">
              {currentProposal?.companyDetails?.preparedFor
                ? `Proposal prepared for ${currentProposal.companyDetails.preparedFor}`
                : "Corporate proposal editor & live A4 preview"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "split"
                  ? "bg-white dark:bg-[#1D63ED] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
                viewMode === "editor"
                  ? "bg-white dark:bg-[#1D63ED] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
                viewMode === "preview"
                  ? "bg-white dark:bg-[#1D63ED] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="A4 Document Preview Only"
            >
              <FiEye />
              <span className="hidden sm:inline">Preview</span>
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
            <span className="hidden md:inline">Reset Sample</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold shadow-sm hover:bg-slate-900 transition"
            title="Download PDF document"
          >
            <FiDownload />
            <span>PDF</span>
          </button>

          {/* Print Clean Window */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D63ED] text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition"
            title="Open Print Dialog (Exact A4 Preview Layout)"
          >
            <FiPrinter />
            <span>Print Layout</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition ${
              saveSuccess ? "bg-emerald-600" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {saveSuccess ? <FiCheck /> : <FiSave />}
            <span>{saveSuccess ? "Saved!" : saving ? "Saving…" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Main Full-Width Workspace */}
      <div className="w-full flex items-start gap-4">
        {/* Proposal Sidebar with Collapse state */}
        <ProposalSidebar
          proposals={proposals}
          selectedId={selectedId}
          onSelectProposal={handleSelectProposal}
          onCreateNew={handleCreateNew}
          onDuplicateProposal={handleDuplicateProposal}
          onDeleteProposal={handleDeleteProposal}
          isDark={isDark}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Area */}
        {currentProposal ? (
          <div className="flex-1 w-full min-w-0">
            {viewMode === "split" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start w-full">
                {/* Editor Column */}
                <div className="xl:col-span-6 w-full">
                  <ProposalEditor
                    proposal={currentProposal}
                    onChange={setCurrentProposal}
                    isDark={isDark}
                  />
                </div>

                {/* Live Preview Column with Zoom Controls */}
                <div className="xl:col-span-6 w-full flex flex-col gap-2">
                  {/* Zoom Controls */}
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-500">
                    <span className="font-bold flex items-center gap-1.5">
                      <FiEye className="text-[#1D63ED]" />
                      <span>Live A4 Preview</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewZoom(75)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${previewZoom === 75 ? "bg-[#1D63ED] text-white" : "hover:bg-slate-200 dark:hover:bg-white/10"}`}
                      >
                        75%
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewZoom(88)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${previewZoom === 88 ? "bg-[#1D63ED] text-white" : "hover:bg-slate-200 dark:hover:bg-white/10"}`}
                      >
                        88%
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewZoom(100)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${previewZoom === 100 ? "bg-[#1D63ED] text-white" : "hover:bg-slate-200 dark:hover:bg-white/10"}`}
                      >
                        100%
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto pb-10 w-full flex justify-center">
                    <div
                      style={{
                        transform: `scale(${previewZoom / 100})`,
                        transformOrigin: "top center",
                        width: "100%",
                        maxWidth: "794px"
                      }}
                    >
                      <ProposalDocumentPreview
                        ref={printRef}
                        proposal={currentProposal}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === "editor" && (
              <div className="w-full max-w-5xl mx-auto">
                <ProposalEditor
                  proposal={currentProposal}
                  onChange={setCurrentProposal}
                  isDark={isDark}
                />
              </div>
            )}

            {viewMode === "preview" && (
              <div className="w-full flex justify-center overflow-x-auto pb-12">
                <div className="w-full max-w-[794px]">
                  <ProposalDocumentPreview
                    ref={printRef}
                    proposal={currentProposal}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 p-12 text-center text-slate-400">
            No proposal selected. Click <strong>New</strong> in the sidebar to create one.
          </div>
        )}
      </div>
    </div>
  );
}
