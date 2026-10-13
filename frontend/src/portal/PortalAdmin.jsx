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
  FiShield,
  FiMenu,
  FiX,
  FiChevronRight
} from "react-icons/fi";
import { Link } from "react-router-dom";
import rapidoWordmark from "../assets/logo/rapido-wordmark-cropped.png";
import ProposalGenerator from "./proposal/ProposalGenerator";

export default function PortalAdmin() {
  const { admin, loading, logout, isDark } = usePortal();
  const [activeTab, setActiveTab] = useState("proposals"); // 'list' | 'create' | 'proposals'
  const [editingProject, setEditingProject] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      className={`min-h-screen font-sans flex transition-colors duration-300 selection:bg-rapido-blue selection:text-white ${
        isDark ? "bg-rapido-navy text-white" : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* Background Ambient Lights */}
      {isDark ? (
        <div className="pointer-events-none fixed inset-0 overflow-hidden print:hidden">
          <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-rapido-blue/15 blur-[150px]" />
          <div className="absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-rapido-sky/10 blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[160px]" />
          <div className="absolute inset-0 bg-grid-dark opacity-15" />
        </div>
      ) : (
        <div className="pointer-events-none fixed inset-0 overflow-hidden print:hidden">
          <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-200/40 blur-[150px]" />
          <div className="absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-sky-200/40 blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-200/30 blur-[160px]" />
          <div className="absolute inset-0 bg-grid-light opacity-35" />
        </div>
      )}

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden print:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= PROPER SAAS SIDEBAR ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r transition-transform duration-300 lg:static lg:translate-x-0 print:hidden shrink-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isDark
            ? "bg-[#0a1526]/95 border-white/10 text-white backdrop-blur-xl"
            : "bg-white/95 border-slate-200 text-slate-900 shadow-lg lg:shadow-none backdrop-blur-xl"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/70 dark:border-white/10">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Rapido Solutions">
            <img
              src={rapidoWordmark}
              alt="Rapido Solutions"
              className={`h-7 w-auto object-contain transition ${isDark ? "brightness-0 invert" : ""}`}
            />
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isDark
                  ? "bg-rapido-blue/20 border border-rapido-sky/30 text-rapido-sky"
                  : "bg-blue-50 border border-blue-200 text-blue-700"
              }`}
            >
              <FiShield className="text-[9px]" />
              <span>Portal</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Management
            </p>
            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("proposals");
                  setEditingProject(null);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "proposals"
                    ? "bg-[#1D63ED] text-white shadow-sm"
                    : isDark
                    ? "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiFileText className="text-base" />
                  <span>Proposal Generator</span>
                </div>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    activeTab === "proposals"
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  }`}
                >
                  Tool
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("list");
                  setEditingProject(null);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "list"
                    ? "bg-[#1D63ED] text-white shadow-sm"
                    : isDark
                    ? "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiFolder className="text-base" />
                  <span>All Projects</span>
                </div>
                {activeTab === "list" && <FiChevronRight className="text-xs" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAddNew();
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "create"
                    ? "bg-[#1D63ED] text-white shadow-sm"
                    : isDark
                    ? "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiPlusCircle className="text-base" />
                  <span>{editingProject ? "Edit Project" : "Add Project"}</span>
                </div>
                {activeTab === "create" && <FiChevronRight className="text-xs" />}
              </button>
            </nav>
          </div>

          <div>
            <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Public Previews
            </p>
            <div className="space-y-1.5">
              <Link
                to="/projects"
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isDark
                    ? "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiExternalLink className="text-base text-rapido-sky" />
                  <span>Public Projects Gallery</span>
                </div>
              </Link>
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isDark
                    ? "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiGlobe className="text-base text-emerald-400" />
                  <span>Rapido Website Home</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Profile & Logout */}
        <div className="p-4 border-t border-slate-200/70 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className={`text-xs font-bold max-w-[160px] truncate ${isDark ? "text-white" : "text-slate-800"}`}>
                {admin.email}
              </span>
              <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Session Active
              </span>
            </div>
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-500/20 hover:text-red-700 transition"
          >
            <FiLogOut className="text-xs" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WORKSPACE ================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Minimal Header */}
        <header
          className={`sticky top-0 z-30 flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 border-b backdrop-blur-xl transition-colors print:hidden ${
            isDark
              ? "border-white/10 bg-[#0c182c]/85 text-white"
              : "border-slate-200/80 bg-white/90 text-slate-900 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
              title="Open Navigation Menu"
            >
              <FiMenu className="text-lg" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                {activeTab === "proposals"
                  ? "Proposal Generator Tool"
                  : activeTab === "list"
                  ? "Project Management"
                  : editingProject
                  ? "Edit Project"
                  : "Add Project"}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {activeTab === "proposals"
                  ? "Build, customize, and export corporate proposals with live A4 preview"
                  : "Manage public case studies and portfolio entries"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/projects"
              target="_blank"
              rel="noreferrer"
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                isDark
                  ? "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900 shadow-2xs"
              }`}
            >
              <FiGlobe className="text-xs text-rapido-sky" />
              <span>Live Site</span>
              <FiExternalLink className="text-[10px]" />
            </Link>

            <button
              type="button"
              onClick={logout}
              className="sm:hidden p-2 rounded-xl text-red-500 hover:bg-red-500/10"
              title="Sign Out"
            >
              <FiLogOut />
            </button>
          </div>
        </header>

        {/* Dynamic Full Width / Centered Main Container */}
        <main
          className={`relative z-10 flex-1 w-full ${
            activeTab === "proposals"
              ? "p-2 sm:p-4 lg:p-6"
              : "max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8"
          }`}
        >
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
      </div>
    </div>
  );
}
