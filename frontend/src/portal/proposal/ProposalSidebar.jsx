import { useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit3,
  FiCopy,
  FiTrash2,
  FiFileText,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

export default function ProposalSidebar({
  proposals = [],
  selectedId,
  onSelectProposal,
  onCreateNew,
  onDuplicateProposal,
  onDeleteProposal,
  isDark = false,
  isCollapsed = false,
  onToggleCollapse
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const filteredProposals = proposals.filter((p) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = (p.title || "").toLowerCase().includes(term);
    const clientMatch = (p.companyDetails?.preparedFor || "").toLowerCase().includes(term);
    return titleMatch || clientMatch;
  });

  if (isCollapsed) {
    return (
      <div
        className={`flex flex-col items-center gap-3 p-2.5 rounded-2xl border transition-colors shrink-0 ${
          isDark
            ? "bg-[#0c182c]/90 border-white/10 text-white"
            : "bg-white border-slate-200 text-slate-900 shadow-xs"
        }`}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
          title="Expand Proposals Sidebar"
        >
          <FiChevronRight className="text-base" />
        </button>

        <button
          type="button"
          onClick={onCreateNew}
          className="p-2 rounded-xl bg-[#1D63ED] text-white hover:bg-blue-700 shadow-sm transition"
          title="Create New Proposal"
        >
          <FiPlus className="text-base" />
        </button>

        <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-200/50 w-full">
          {proposals.map((prop) => {
            const isSelected = prop.id === selectedId;
            return (
              <button
                key={prop.id}
                type="button"
                onClick={() => onSelectProposal(prop.id)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition ${
                  isSelected
                    ? "bg-[#1D63ED] text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
                title={prop.title || "Proposal"}
              >
                <FiFileText className="text-sm" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <aside
      className={`w-full lg:w-72 xl:w-80 flex flex-col shrink-0 rounded-2xl border p-4 transition-colors ${
        isDark
          ? "bg-[#0c182c]/90 border-white/10 text-white"
          : "bg-white border-slate-200 text-slate-900 shadow-xs"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <FiFileText className="text-[#1D63ED] text-lg" />
          <h3 className="text-sm font-bold tracking-tight">Proposals</h3>
          <span className="flex h-5 items-center justify-center rounded-full bg-[#1D63ED]/15 px-2 text-[11px] font-bold text-[#1D63ED]">
            {proposals.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-1 rounded-xl bg-[#1D63ED] px-2.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            title="Create a new proposal"
          >
            <FiPlus />
            <span>New</span>
          </button>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition hidden lg:inline-flex"
              title="Collapse Proposals Sidebar"
            >
              <FiChevronLeft className="text-base" />
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3.5">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search proposals or clients…"
          className={`w-full rounded-xl border pl-8 pr-3 py-1.5 text-xs transition focus:outline-none focus:ring-2 focus:ring-[#1D63ED]/30 ${
            isDark
              ? "bg-[#111f35] border-white/10 text-white placeholder-slate-500"
              : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
          }`}
        />
      </div>

      {/* Proposal Cards List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        {filteredProposals.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No proposals found. Click <strong>+ New</strong> to create one.
          </div>
        ) : (
          filteredProposals.map((prop) => {
            const isSelected = prop.id === selectedId;
            const currency = prop.pricing?.currency || "USD";
            const amount = prop.pricing?.summaryCards?.customDevAmount || "";

            return (
              <div
                key={prop.id}
                onClick={() => onSelectProposal(prop.id)}
                className={`group relative cursor-pointer rounded-xl border p-3 transition ${
                  isSelected
                    ? "border-[#1D63ED] bg-blue-500/10 shadow-sm ring-1 ring-[#1D63ED]"
                    : isDark
                    ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20"
                    : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
                }`}
              >
                {/* Proposal Title */}
                <h4
                  className={`text-xs font-bold leading-snug line-clamp-2 ${
                    isSelected
                      ? "text-[#1D63ED]"
                      : isDark
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  {prop.title || "Untitled Proposal"}
                </h4>

                {/* Client & Date */}
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[140px]">
                    {prop.companyDetails?.preparedFor
                      ? `For: ${prop.companyDetails.preparedFor}`
                      : "General Proposal"}
                  </span>
                  <span>{prop.companyDetails?.date || "2026"}</span>
                </div>

                {/* Amount & Actions row */}
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/40">
                  <span className="text-[11px] font-bold text-emerald-600">
                    {amount ? `${currency} ${amount}` : "Ready"}
                  </span>

                  {/* Actions buttons */}
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onDuplicateProposal(prop.id)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition"
                      title="Duplicate proposal"
                    >
                      <FiCopy className="text-xs" />
                    </button>

                    {deleteConfirmId === prop.id ? (
                      <div className="flex items-center gap-1 bg-red-500/20 px-1 py-0.5 rounded">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteProposal(prop.id);
                            setDeleteConfirmId(null);
                          }}
                          className="text-red-500 hover:text-red-600 p-0.5 font-bold text-xs"
                          title="Confirm delete"
                        >
                          <FiCheck />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-slate-400 hover:text-slate-300 p-0.5 text-xs"
                          title="Cancel"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(prop.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                        title="Delete proposal"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
