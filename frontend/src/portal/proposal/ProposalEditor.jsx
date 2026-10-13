import { useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiImage,
  FiGrid,
  FiCpu,
  FiDollarSign,
  FiFileText,
  FiCheckCircle,
  FiUpload
} from "react-icons/fi";
import RichTextToolbar from "./RichTextToolbar";
import { AVAILABLE_TECHS } from "./TechBadges";
import { uploadProposalImage } from "../../utils/proposalApi";

export default function ProposalEditor({ proposal, onChange, isDark = false }) {
  const [activeTab, setActiveTab] = useState("cover"); // 'cover' | 'sections' | 'pricing' | 'terms' | 'signoff'
  const [uploadingImageSecId, setUploadingImageSecId] = useState(null);

  if (!proposal) return null;

  const updateField = (path, value) => {
    const updated = JSON.parse(JSON.stringify(proposal));
    const parts = path.split(".");
    let curr = updated;
    for (let i = 0; i < parts.length - 1; i++) {
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = value;
    onChange(updated);
  };

  // Section operations
  const addSection = () => {
    const nextNum = (proposal.sections?.length || 0) + 1;
    const newSection = {
      id: `sec-${Date.now()}`,
      number: String(nextNum),
      title: "New Section Title",
      subtitle: "",
      contentHtml: "<p>Write your detailed proposal section content here...</p>",
      table: null,
      image: null,
      techStack: []
    };
    onChange({
      ...proposal,
      sections: [...(proposal.sections || []), newSection]
    });
  };

  const removeSection = (secId) => {
    onChange({
      ...proposal,
      sections: (proposal.sections || []).filter((s) => s.id !== secId)
    });
  };

  const moveSection = (index, direction) => {
    const secs = [...(proposal.sections || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= secs.length) return;
    const temp = secs[index];
    secs[index] = secs[targetIdx];
    secs[targetIdx] = temp;
    onChange({ ...proposal, sections: secs });
  };

  const updateSection = (secId, field, value) => {
    const secs = (proposal.sections || []).map((s) => {
      if (s.id === secId) {
        return { ...s, [field]: value };
      }
      return s;
    });
    onChange({ ...proposal, sections: secs });
  };

  // Table operations for a section
  const toggleSectionTable = (secId) => {
    const secs = (proposal.sections || []).map((s) => {
      if (s.id === secId) {
        if (s.table && s.table.enabled) {
          return { ...s, table: null };
        } else {
          return {
            ...s,
            table: {
              enabled: true,
              headerColor: "#1D63ED",
              headerTextColor: "#ffffff",
              headers: ["Item", "Quantity", "Description"],
              rows: [
                ["Deliverable item 1", "01", "Core functionality and responsive layout."],
                ["Deliverable item 2", "01", "Administration panel and reporting tools."]
              ]
            }
          };
        }
      }
      return s;
    });
    onChange({ ...proposal, sections: secs });
  };

  const addTableRow = (secId) => {
    const secs = (proposal.sections || []).map((s) => {
      if (s.id === secId && s.table) {
        const colCount = s.table.headers.length || 3;
        const newRow = Array(colCount).fill("New detail");
        return {
          ...s,
          table: {
            ...s.table,
            rows: [...(s.table.rows || []), newRow]
          }
        };
      }
      return s;
    });
    onChange({ ...proposal, sections: secs });
  };

  const removeTableRow = (secId, rowIdx) => {
    const secs = (proposal.sections || []).map((s) => {
      if (s.id === secId && s.table) {
        return {
          ...s,
          table: {
            ...s.table,
            rows: s.table.rows.filter((_, idx) => idx !== rowIdx)
          }
        };
      }
      return s;
    });
    onChange({ ...proposal, sections: secs });
  };

  const updateTableCell = (secId, rowIdx, colIdx, value) => {
    const secs = (proposal.sections || []).map((s) => {
      if (s.id === secId && s.table) {
        const rows = s.table.rows.map((row, rI) => {
          if (rI === rowIdx) {
            const nextRow = [...row];
            nextRow[colIdx] = value;
            return nextRow;
          }
          return row;
        });
        return {
          ...s,
          table: { ...s.table, rows }
        };
      }
      return s;
    });
    onChange({ ...proposal, sections: secs });
  };

  const addTableColumn = (secId) => {
    const secs = (proposal.sections || []).map((s) => {
      if (s.id === secId && s.table) {
        const nextHeaders = [...s.table.headers, `Col ${s.table.headers.length + 1}`];
        const nextRows = s.table.rows.map((row) => [...row, ""]);
        return {
          ...s,
          table: {
            ...s.table,
            headers: nextHeaders,
            rows: nextRows
          }
        };
      }
      return s;
    });
    onChange({ ...proposal, sections: secs });
  };

  // Image operations for a section
  const toggleSectionImage = (secId) => {
    const secs = (proposal.sections || []).map((s) => {
      if (s.id === secId) {
        if (s.image && s.image.enabled) {
          return { ...s, image: null };
        } else {
          return {
            ...s,
            image: {
              enabled: true,
              url: "",
              title: "Figure: Architecture Overview",
              size: "medium", // 'small' | 'medium' | 'large'
              align: "center"
            }
          };
        }
      }
      return s;
    });
    onChange({ ...proposal, sections: secs });
  };

  const handleImageFileUpload = async (secId, file) => {
    if (!file) return;
    try {
      setUploadingImageSecId(secId);
      const url = await uploadProposalImage(file);
      const secs = (proposal.sections || []).map((s) => {
        if (s.id === secId && s.image) {
          return {
            ...s,
            image: { ...s.image, url }
          };
        }
        return s;
      });
      onChange({ ...proposal, sections: secs });
    } catch (err) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploadingImageSecId(null);
    }
  };

  // Milestone operations
  const addMilestone = () => {
    const newMs = {
      id: `ms-${Date.now()}`,
      milestone: "New Milestone",
      share: "50%",
      amount: "500"
    };
    const nextMilestones = [...(proposal.pricing?.milestones || []), newMs];
    updateField("pricing.milestones", nextMilestones);
  };

  const removeMilestone = (msId) => {
    const nextMilestones = (proposal.pricing?.milestones || []).filter((m) => m.id !== msId);
    updateField("pricing.milestones", nextMilestones);
  };

  // Term operations
  const addTerm = () => {
    const newTerm = {
      id: `term-${Date.now()}`,
      label: "New Term",
      text: "Specify agreement condition and details here."
    };
    onChange({
      ...proposal,
      terms: [...(proposal.terms || []), newTerm]
    });
  };

  const removeTerm = (termId) => {
    onChange({
      ...proposal,
      terms: (proposal.terms || []).filter((t) => t.id !== termId)
    });
  };

  const inputClass = `w-full rounded-xl border px-3.5 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-rapido-blue/30 ${
    isDark
      ? "bg-[#111f35] border-white/10 text-white placeholder-slate-500 focus:border-rapido-sky"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-rapido-blue shadow-sm"
  }`;

  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${
    isDark ? "text-slate-300" : "text-slate-700"
  }`;

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation */}
      <div
        className={`flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl border ${
          isDark ? "bg-[#0b1728] border-white/10" : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        {[
          { id: "cover", label: "1. Cover & Company Details", icon: FiFileText },
          { id: "sections", label: "2. Headings & Content", icon: FiGrid },
          { id: "pricing", label: "3. Pricing & Schedule", icon: FiDollarSign },
          { id: "terms", label: "4. Terms & Conditions", icon: FiCheckCircle },
          { id: "signoff", label: "5. Sign-Off & Footer", icon: FiCheckCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? "bg-[#1D63ED] text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="text-sm" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: COVER & COMPANY DETAILS ================= */}
      {activeTab === "cover" && (
        <div
          className={`p-6 rounded-2xl border flex flex-col gap-5 ${
            isDark ? "bg-[#0c182c]/90 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="border-b pb-3 mb-1 border-slate-200/50">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>
              First Page — Company & Project Details
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configures the standalone front cover page and core proposal branding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Proposal Eyebrow / Tagline</label>
              <input
                type="text"
                value={proposal.eyebrow || ""}
                onChange={(e) => updateField("eyebrow", e.target.value)}
                placeholder="e.g. WEB & DELIVERY TECHNOLOGY PROPOSAL"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Main Project Name</label>
              <input
                type="text"
                value={proposal.title || ""}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Delivery Management System + Web App"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Deliverables Subtitle (Separated by Pipes)</label>
              <input
                type="text"
                value={proposal.subtitle || ""}
                onChange={(e) => updateField("subtitle", e.target.value)}
                placeholder="e.g. 2 Courier Websites | 2 Admin Panels | Web App"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Prepared By</label>
              <input
                type="text"
                value={proposal.companyDetails?.preparedBy || ""}
                onChange={(e) => updateField("companyDetails.preparedBy", e.target.value)}
                placeholder="e.g. Rapido Solutions Co."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Prepared For (Client Name / Company)</label>
              <input
                type="text"
                value={proposal.companyDetails?.preparedFor || ""}
                onChange={(e) => updateField("companyDetails.preparedFor", e.target.value)}
                placeholder="e.g. Mr. Arshad"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Proposal Issue Date</label>
              <input
                type="text"
                value={proposal.companyDetails?.date || ""}
                onChange={(e) => updateField("companyDetails.date", e.target.value)}
                placeholder="e.g. September 2026"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Footer Document Reference</label>
              <input
                type="text"
                value={proposal.companyDetails?.footerReference || ""}
                onChange={(e) => updateField("companyDetails.footerReference", e.target.value)}
                placeholder="e.g. Rapido Solutions Co. | Delivery Management System Proposal"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Upwork Profile Link</label>
              <input
                type="text"
                value={proposal.companyDetails?.upworkUrl || ""}
                onChange={(e) => updateField("companyDetails.upworkUrl", e.target.value)}
                placeholder="https://www.upwork.com/agencies/rapidosolutions/"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Company Profile Link</label>
              <input
                type="text"
                value={proposal.companyDetails?.companyUrl || ""}
                onChange={(e) => updateField("companyDetails.companyUrl", e.target.value)}
                placeholder="https://rapidosolutions.com"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: HEADINGS & CONTENT ================= */}
      {activeTab === "sections" && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>
                Proposal Headings & Subheadings
              </h3>
              <p className="text-xs text-slate-400">
                Add, reorder, format with rich text, tables, images, and tech stack logos.
              </p>
            </div>
            <button
              type="button"
              onClick={addSection}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D63ED] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <FiPlus />
              <span>Add Heading</span>
            </button>
          </div>

          {(proposal.sections || []).map((sec, idx) => (
            <div
              key={sec.id}
              className={`p-5 rounded-2xl border flex flex-col gap-4 transition ${
                isDark ? "bg-[#0c182c]/90 border-white/10" : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              {/* Section Header Controls */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-200/50">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rapido-blue text-xs font-black text-white">
                    {sec.number || idx + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Heading #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30"
                    title="Move Up"
                  >
                    <FiArrowUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, 1)}
                    disabled={idx === (proposal.sections || []).length - 1}
                    className="p-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30"
                    title="Move Down"
                  >
                    <FiArrowDown />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(sec.id)}
                    className="p-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-500/20"
                    title="Delete Section"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {/* Title & Number inputs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-1">
                  <label className={labelClass}>Numbering</label>
                  <input
                    type="text"
                    value={sec.number || ""}
                    onChange={(e) => updateSection(sec.id, "number", e.target.value)}
                    placeholder="e.g. 1"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={labelClass}>Heading Title</label>
                  <input
                    type="text"
                    value={sec.title || ""}
                    onChange={(e) => updateSection(sec.id, "title", e.target.value)}
                    placeholder="e.g. Project Overview"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Rich Text Editor for this section */}
              <div>
                <label className={labelClass}>Content & Details</label>
                <div className="rounded-xl border overflow-hidden border-slate-300">
                  <RichTextToolbar isDark={isDark} />
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateSection(sec.id, "contentHtml", e.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: sec.contentHtml || "" }}
                    className={`min-h-[120px] p-4 text-xs sm:text-sm focus:outline-none leading-relaxed ${
                      isDark ? "bg-[#0b1728] text-white" : "bg-white text-slate-900"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Use the toolbar above to apply bold, italic, underline, text/background colors, bullet points, or numbering.
                </p>
              </div>

              {/* Additional Elements Toolbar (Table, Image, Tech Stack) */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/50">
                <button
                  type="button"
                  onClick={() => toggleSectionTable(sec.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    sec.table?.enabled
                      ? "bg-[#1D63ED] text-white"
                      : isDark
                      ? "bg-white/5 text-slate-300 hover:bg-white/10"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <FiGrid />
                  <span>{sec.table?.enabled ? "✓ Table Added" : "+ Add Table"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleSectionImage(sec.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    sec.image?.enabled
                      ? "bg-[#1D63ED] text-white"
                      : isDark
                      ? "bg-white/5 text-slate-300 hover:bg-white/10"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <FiImage />
                  <span>{sec.image?.enabled ? "✓ Image Added" : "+ Add WebP Image"}</span>
                </button>
              </div>

              {/* TABLE CONFIGURATION IF ACTIVE */}
              {sec.table && sec.table.enabled && (
                <div
                  className={`p-4 rounded-xl border mt-2 flex flex-col gap-3 ${
                    isDark ? "bg-[#081220] border-white/10" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1D63ED]">
                      Table Editor
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>Header Color:</span>
                        <input
                          type="color"
                          value={sec.table.headerColor || "#1D63ED"}
                          onChange={(e) => {
                            const nextTable = { ...sec.table, headerColor: e.target.value };
                            updateSection(sec.id, "table", nextTable);
                          }}
                          className="h-6 w-8 rounded cursor-pointer border p-0 bg-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => addTableColumn(sec.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-300"
                      >
                        + Col
                      </button>
                      <button
                        type="button"
                        onClick={() => addTableRow(sec.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#1D63ED] text-white text-xs font-bold hover:bg-blue-700"
                      >
                        + Row
                      </button>
                    </div>
                  </div>

                  {/* Column Headers */}
                  <div className="grid grid-cols-3 gap-2">
                    {sec.table.headers.map((hdr, hIdx) => (
                      <input
                        key={hIdx}
                        type="text"
                        value={hdr}
                        onChange={(e) => {
                          const nextHeaders = [...sec.table.headers];
                          nextHeaders[hIdx] = e.target.value;
                          updateSection(sec.id, "table", { ...sec.table, headers: nextHeaders });
                        }}
                        className={`text-xs font-bold p-2 rounded-lg border text-center ${
                          isDark ? "bg-[#111f35] text-white border-white/15" : "bg-white text-slate-900 border-slate-300"
                        }`}
                        placeholder={`Header ${hIdx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Rows */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {sec.table.rows.map((row, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-2">
                        <div className="grid grid-cols-3 gap-2 flex-1">
                          {row.map((cell, cIdx) => (
                            <input
                              key={cIdx}
                              type="text"
                              value={cell}
                              onChange={(e) => updateTableCell(sec.id, rIdx, cIdx, e.target.value)}
                              className={`text-xs p-2 rounded-lg border ${
                                isDark ? "bg-[#111f35] text-white border-white/15" : "bg-white text-slate-900 border-slate-300"
                              }`}
                              placeholder={`Row ${rIdx + 1} Cell ${cIdx + 1}`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTableRow(sec.id, rIdx)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg text-xs"
                          title="Remove row"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IMAGE CONFIGURATION IF ACTIVE */}
              {sec.image && sec.image.enabled && (
                <div
                  className={`p-4 rounded-xl border mt-2 flex flex-col gap-3 ${
                    isDark ? "bg-[#081220] border-white/10" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1D63ED]">
                      WebP Image Configuration
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Size:</span>
                      {["small", "medium", "large"].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            const nextImg = { ...sec.image, size: sz };
                            updateSection(sec.id, "image", nextImg);
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                            sec.image.size === sz
                              ? "bg-[#1D63ED] text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Image URL (or upload WebP)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={sec.image.url || ""}
                          onChange={(e) => {
                            const nextImg = { ...sec.image, url: e.target.value };
                            updateSection(sec.id, "image", nextImg);
                          }}
                          placeholder="https://... or upload below"
                          className={inputClass}
                        />
                        <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rapido-blue text-white text-xs font-bold shrink-0 hover:bg-blue-700 transition">
                          <FiUpload />
                          <span>{uploadingImageSecId === sec.id ? "Uploading…" : "Upload"}</span>
                          <input
                            type="file"
                            accept="image/webp,image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) => handleImageFileUpload(sec.id, e.target.files?.[0])}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Image Title / Caption</label>
                      <input
                        type="text"
                        value={sec.image.title || ""}
                        onChange={(e) => {
                          const nextImg = { ...sec.image, title: e.target.value };
                          updateSection(sec.id, "image", nextImg);
                        }}
                        placeholder="e.g. Figure: System Architecture Flow"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {sec.image.url && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={sec.image.url}
                        alt="Preview"
                        className="h-16 w-24 object-contain rounded border border-slate-300 bg-white"
                      />
                      <span className="text-xs text-slate-400">Image loaded ready for proposal display</span>
                    </div>
                  )}
                </div>
              )}

              {/* TECH STACK LOGOS ROW TOGGLE */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Tech Stack Badges for this Section:
                </span>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TECHS.map((tech) => {
                    const isSelected = (sec.techStack || []).includes(tech.id);
                    return (
                      <button
                        key={tech.id}
                        type="button"
                        onClick={() => {
                          const current = sec.techStack || [];
                          const next = isSelected
                            ? current.filter((id) => id !== tech.id)
                            : [...current, tech.id];
                          updateSection(sec.id, "techStack", next);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? "bg-[#1D63ED] text-white shadow-sm"
                            : isDark
                            ? "bg-white/5 text-slate-400 hover:text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {tech.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 3: PRICING & SCHEDULE ================= */}
      {activeTab === "pricing" && (
        <div
          className={`p-6 rounded-2xl border flex flex-col gap-6 ${
            isDark ? "bg-[#0c182c]/90 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4 border-slate-200/50">
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>
                Cost & Schedule Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Configure payment milestones, currency options (USD / PKR), bank info, and summary metrics.
              </p>
            </div>

            {/* CURRENCY SWITCHER: USD vs PKR */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-300">
              <button
                type="button"
                onClick={() => updateField("pricing.currency", "USD")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                  proposal.pricing?.currency === "USD"
                    ? "bg-[#1D63ED] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => updateField("pricing.currency", "PKR")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                  proposal.pricing?.currency === "PKR"
                    ? "bg-[#1D63ED] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                PKR (Rs.)
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Payment Schedule Heading Title</label>
            <input
              type="text"
              value={proposal.pricing?.paymentScheduleTitle || ""}
              onChange={(e) => updateField("pricing.paymentScheduleTitle", e.target.value)}
              placeholder="e.g. 14. Payment Schedule — Delivery Management System"
              className={inputClass}
            />
          </div>

          {/* Milestones list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass}>Milestones Breakdown</label>
              <button
                type="button"
                onClick={addMilestone}
                className="px-3 py-1 rounded-lg bg-[#1D63ED] text-white text-xs font-bold hover:bg-blue-700"
              >
                + Add Milestone
              </button>
            </div>

            <div className="space-y-2">
              {(proposal.pricing?.milestones || []).map((ms, idx) => (
                <div key={ms.id || idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ms.milestone}
                    onChange={(e) => {
                      const next = [...(proposal.pricing?.milestones || [])];
                      next[idx].milestone = e.target.value;
                      updateField("pricing.milestones", next);
                    }}
                    placeholder="Milestone description"
                    className={`flex-1 ${inputClass}`}
                  />
                  <input
                    type="text"
                    value={ms.share}
                    onChange={(e) => {
                      const next = [...(proposal.pricing?.milestones || [])];
                      next[idx].share = e.target.value;
                      updateField("pricing.milestones", next);
                    }}
                    placeholder="Share % (e.g. 50%)"
                    className={`w-28 ${inputClass}`}
                  />
                  <div className="relative w-36">
                    <input
                      type="text"
                      value={ms.amount}
                      onChange={(e) => {
                        const next = [...(proposal.pricing?.milestones || [])];
                        next[idx].amount = e.target.value;
                        updateField("pricing.milestones", next);
                      }}
                      placeholder={`Amount (${proposal.pricing?.currency || "USD"})`}
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMilestone(ms.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg text-xs"
                    title="Remove milestone"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Bank Account & Payment Details Note</label>
            <textarea
              rows={2}
              value={proposal.pricing?.paymentDetails || ""}
              onChange={(e) => updateField("pricing.paymentDetails", e.target.value)}
              placeholder="Askari Bank Ltd. | Account Title: Rapido Solutions Co. | Account No.: ... | IBAN: ..."
              className={inputClass}
            />
          </div>

          {/* Bottom Summary Metric Cards */}
          <div className="border-t pt-4 border-slate-200/50">
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Summary Highlight Cards (Page Bottom)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Custom Development Total</label>
                <input
                  type="text"
                  value={proposal.pricing?.summaryCards?.customDevAmount || ""}
                  onChange={(e) => updateField("pricing.summaryCards.customDevAmount", e.target.value)}
                  placeholder="e.g. 1,320"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Timeline</label>
                <input
                  type="text"
                  value={proposal.pricing?.summaryCards?.timeline || ""}
                  onChange={(e) => updateField("pricing.summaryCards.timeline", e.target.value)}
                  placeholder="e.g. 3 MONTHS"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Monthly Management</label>
                <input
                  type="text"
                  value={proposal.pricing?.summaryCards?.monthlyManagement || ""}
                  onChange={(e) => updateField("pricing.summaryCards.monthlyManagement", e.target.value)}
                  placeholder="e.g. 99 / WEBSITE"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: TERMS & CONDITIONS ================= */}
      {activeTab === "terms" && (
        <div
          className={`p-6 rounded-2xl border flex flex-col gap-5 ${
            isDark ? "bg-[#0c182c]/90 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-slate-200/50">
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>
                Proposal Terms & Conditions
              </h3>
              <p className="text-xs text-slate-400">
                Key terms (API Dependency, Scope Changes, Acceptance, Ownership, etc.)
              </p>
            </div>
            <button
              type="button"
              onClick={addTerm}
              className="px-3.5 py-2 rounded-xl bg-[#1D63ED] text-white text-xs font-bold hover:bg-blue-700 shadow-sm"
            >
              + Add Term
            </button>
          </div>

          <div className="space-y-3">
            {(proposal.terms || []).map((term, tIdx) => (
              <div
                key={term.id || tIdx}
                className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
                  isDark ? "bg-[#081220] border-white/10" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={term.label}
                    onChange={(e) => {
                      const next = [...(proposal.terms || [])];
                      next[tIdx].label = e.target.value;
                      onChange({ ...proposal, terms: next });
                    }}
                    placeholder="Term Label (e.g. Scope Changes)"
                    className={`w-1/2 font-bold ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeTerm(term.id)}
                    className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg text-xs"
                    title="Delete term"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={term.text}
                  onChange={(e) => {
                    const next = [...(proposal.terms || [])];
                    next[tIdx].text = e.target.value;
                    onChange({ ...proposal, terms: next });
                  }}
                  placeholder="Term specification details..."
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: SIGNOFF & FOOTER ================= */}
      {activeTab === "signoff" && (
        <div
          className={`p-6 rounded-2xl border flex flex-col gap-5 ${
            isDark ? "bg-[#0c182c]/90 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="border-b pb-3 border-slate-200/50">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>
              Acceptance & Signature Section
            </h3>
            <p className="text-xs text-slate-400">
              Final sign-off table, agreement wording, and agency signature lines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Section Number</label>
              <input
                type="text"
                value={proposal.acceptance?.sectionNumber || ""}
                onChange={(e) => updateField("acceptance.sectionNumber", e.target.value)}
                placeholder="e.g. 15"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Section Title</label>
              <input
                type="text"
                value={proposal.acceptance?.title || ""}
                onChange={(e) => updateField("acceptance.title", e.target.value)}
                placeholder="e.g. Acceptance & Sign-Off"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Agreement Statement</label>
              <textarea
                rows={2}
                value={proposal.acceptance?.description || ""}
                onChange={(e) => updateField("acceptance.description", e.target.value)}
                placeholder="By signing below, both parties confirm acceptance..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Agency Name</label>
              <input
                type="text"
                value={proposal.acceptance?.agencyName || ""}
                onChange={(e) => updateField("acceptance.agencyName", e.target.value)}
                placeholder="e.g. Rapido Solutions Co."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Agency Tagline</label>
              <input
                type="text"
                value={proposal.acceptance?.agencyTagline || ""}
                onChange={(e) => updateField("acceptance.agencyTagline", e.target.value)}
                placeholder="Custom Web Platforms • Delivery Technology..."
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
