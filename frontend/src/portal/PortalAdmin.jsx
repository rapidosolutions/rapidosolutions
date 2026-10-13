import { useState } from "react";
import { usePortal } from "./PortalContext";
import PortalLogin from "./PortalLogin";
import PortalProjectsList from "./PortalProjectsList";
import PortalProjectForm from "./PortalProjectForm";
import ThemeToggle from "./ThemeToggle";
import {
  FiLogOut,
  FiFolder,
  FiPlusCircle,
  FiFileText,
  FiExternalLink,
  FiGlobe,
  FiCheckCircle,
  FiShield
} from "react-icons/fi";
import { Link } from "react-router-dom";
import rapidoWordmark from "../assets/logo/rapido-wordmark-cropped.png";
import ProposalGenerator from "./proposal/ProposalGenerator";

export default function PortalAdmin() {
  const { admin, loading, logout, isDark } = usePortal();
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'create'
  const [editingProject, setEditingProject] = useState(null);

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? "bg-rapido-navy text-white" : "bg-slate-100 text-slate-900"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-rapido-sky/20 border-t-rapido-sky" />
          <p className="text-sm font-semibold tracking-wide text-slate-400">Verifying Admin Session…</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <PortalLogin />;
  }

  const handleAddNew = () => {
    setEditingProject(null);
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaved = () => {
    setEditingProject(null);
    setActiveTab("list");
  };

  const handleCancelForm = () => {
    setEditingProject(null);
    setActiveTab("list");
  };

  return (
    <div
      className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-300 selection:bg-rapido-blue selection:text-white ${
        isDark ? "bg-rapido-navy text-white" : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* Background Ambient Lights */}
      {isDark ? (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-rapido-blue/15 blur-[150px]" />
          <div className="absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-rapido-sky/10 blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[160px]" />
          <div className="absolute inset-0 bg-grid-dark opacity-15" />
        </div>
      ) : (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-200/40 blur-[150px]" />
          <div className="absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-sky-200/40 blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-200/30 blur-[160px]" />
          <div className="absolute inset-0 bg-grid-light opacity-35" />
        </div>
      )}

      {/* Top Header Navigation */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-200 ${
          isDark
            ? "border-white/10 bg-[#0c182c]/85 text-white"
            : "border-slate-200/80 bg-white/90 text-slate-900 shadow-sm"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center" aria-label="Rapido Solutions home">
              <img
                src={rapidoWordmark}
                alt="Rapido Solutions"
                className={`h-7 sm:h-8 w-auto max-w-[160px] object-contain transition ${isDark ? "brightness-0 invert" : ""}`}
              />
            </Link>
            <span
              className={`hidden sm:inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                isDark
                  ? "bg-rapido-blue/20 border border-rapido-sky/30 text-rapido-sky"
                  : "bg-blue-50 border border-blue-200 text-blue-700"
              }`}
            >
              <FiShield className="text-[10px]" />
              <span>Portal</span>
            </span>
          </div>

          {/* Center Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("list");
                setEditingProject(null);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "list"
                  ? "bg-rapido-blue text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <FiFolder className="text-sm" />
              <span>All Projects</span>
            </button>

            <button
              type="button"
              onClick={handleAddNew}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "create"
                  ? "bg-rapido-blue text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <FiPlusCircle className="text-sm" />
              <span>{editingProject ? "Edit Project" : "Add Project"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("proposals");
                setEditingProject(null);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "proposals"
                  ? "bg-rapido-blue text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <FiFileText className="text-sm" />
              <span>Proposals</span>
              <span className="rounded-md bg-white/20 px-1.5 py-0.2 text-[10px] font-black uppercase tracking-wider">
                Generator
              </span>
            </button>
          </nav>

          {/* Right Controls: Theme Toggle, Live Link, User & Logout */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <Link
              to="/projects"
              target="_blank"
              rel="noreferrer"
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                isDark
                  ? "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900 shadow-sm"
              }`}
              title="Open public projects gallery in a new tab"
            >
              <FiGlobe className="text-xs text-rapido-sky" />
              <span>Live Site</span>
              <FiExternalLink className="text-[10px]" />
            </Link>

            <div className="hidden lg:flex flex-col text-right">
              <span className={`text-xs font-bold max-w-[180px] truncate ${isDark ? "text-white" : "text-slate-800"}`}>
                {admin.email}
              </span>
              <span className="text-[10px] text-emerald-500 flex items-center justify-end gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Session Active
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-500/20 hover:text-red-700 transition"
              title="Sign out of Admin Portal"
            >
              <FiLogOut className="text-xs" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {activeTab === "proposals" ? (
          <ProposalGenerator />
        ) : activeTab === "list" ? (
          <PortalProjectsList
            onAddNew={handleAddNew}
            onEditProject={handleEditProject}
          />
        ) : (
          <PortalProjectForm
            editingProject={editingProject}
            onSaved={handleSaved}
            onCancel={handleCancelForm}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`relative z-10 border-t px-6 py-4 text-center text-xs transition-colors ${
          isDark
            ? "border-white/10 bg-[#091322]/85 text-slate-400"
            : "border-slate-200 bg-white/95 text-slate-500 shadow-sm"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <span>Rapido Solutions Co. • Project & Proposal Portal</span>
          <span className="text-[11px] text-slate-400">Live Synchronized System</span>
        </div>
      </footer>
    </div>
  );
}
