import { useState } from "react";
import { usePortal } from "./PortalContext";
import PortalLogin from "./PortalLogin";
import PortalProjectsList from "./PortalProjectsList";
import PortalProjectForm from "./PortalProjectForm";
import {
  FiLogOut,
  FiFolder,
  FiPlusCircle,
  FiExternalLink,
  FiGlobe,
  FiCheckCircle,
  FiShield
} from "react-icons/fi";
import { Link } from "react-router-dom";
import rapidoWordmark from "../assets/logo/rapido-wordmark-cropped.png";
import rapidoIcon from "../assets/logo/rapido-icon-new.png";

export default function PortalAdmin() {
  const { admin, loading, logout } = usePortal();
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'create'
  const [editingProject, setEditingProject] = useState(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rapido-navy text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-rapido-sky" />
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
    <div className="min-h-screen bg-rapido-navy text-white font-sans flex flex-col justify-between selection:bg-rapido-blue selection:text-white">
      {/* Background Ambient Lights */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-rapido-blue/15 blur-[150px]" />
        <div className="absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-rapido-sky/10 blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[160px]" />
        <div className="absolute inset-0 bg-grid-dark opacity-15" />
      </div>

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c182c]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={rapidoIcon} alt="Rapido Icon" className="h-8 w-8 object-contain" />
              <img src={rapidoWordmark} alt="Rapido Solutions" className="h-6 w-auto brightness-0 invert object-contain" />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-rapido-blue/20 border border-rapido-sky/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rapido-sky">
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
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
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
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <FiPlusCircle className="text-sm" />
              <span>{editingProject ? "Edit Project" : "Add Project"}</span>
            </button>
          </nav>

          {/* Right User & Live Link */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link
              to="/projects"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-white/20 hover:text-white transition"
              title="Open public projects gallery in a new tab"
            >
              <FiGlobe className="text-xs text-rapido-sky" />
              <span>Live Site</span>
              <FiExternalLink className="text-[10px]" />
            </Link>

            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-white max-w-[180px] truncate">{admin.email}</span>
              <span className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Session Active
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/20 hover:text-white transition"
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
        {activeTab === "list" ? (
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
      <footer className="relative z-10 border-t border-white/10 bg-[#091322]/85 px-6 py-4 text-center text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <span>Rapido Solutions Co. • Project & Proposal Portal</span>
          <span className="text-[11px] text-slate-400">Live Synchronized System</span>
        </div>
      </footer>
    </div>
  );
}
