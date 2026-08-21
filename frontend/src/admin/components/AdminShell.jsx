import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CV_ADMIN_BASE, cvAdminLogout } from "../lib/cvAdminApi";

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-violet-600 text-white" : "text-violet-100/80 hover:bg-violet-900/60 hover:text-white"
  }`;

export default function AdminShell({ admin, branding, onLogout }) {
  const navigate = useNavigate();
  const isSuper = admin?.role === "super_admin";
  const primary = branding?.primaryColor || "#7c3aed";

  async function handleLogout() {
    try {
      await cvAdminLogout();
    } catch {
      /* ignore */
    }
    onLogout?.();
    navigate(`${CV_ADMIN_BASE}/login`);
  }

  return (
    <div className="min-h-screen bg-[#0b0618] text-violet-50" style={{ ["--cv-primary"]: primary }}>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-violet-900/60 bg-[#12081f] p-5 md:block">
          <div className="mb-8">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="" className="mb-3 h-10 object-contain" />
            ) : null}
            <p className="text-xs uppercase tracking-[0.2em] text-violet-300/70">CV Admin</p>
            <h1 className="mt-1 text-lg font-bold text-white">{branding?.collegeName || "Rapido"}</h1>
          </div>
          <nav className="flex flex-col gap-1">
            <NavLink to={CV_ADMIN_BASE} end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to={`${CV_ADMIN_BASE}/documents`} className={linkClass}>
              Generate Document
            </NavLink>
            <NavLink to={`${CV_ADMIN_BASE}/whatsapp`} className={linkClass}>
              WhatsApp Portal
            </NavLink>
            {isSuper ? (
              <>
                <NavLink to={`${CV_ADMIN_BASE}/templates`} className={linkClass}>
                  Templates
                </NavLink>
                <NavLink to={`${CV_ADMIN_BASE}/branding`} className={linkClass}>
                  Branding
                </NavLink>
                <NavLink to={`${CV_ADMIN_BASE}/admins`} className={linkClass}>
                  Manage Admins
                </NavLink>
              </>
            ) : null}
            <NavLink to={`${CV_ADMIN_BASE}/security`} className={linkClass}>
              Security / 2FA
            </NavLink>
          </nav>
          <div className="mt-10 border-t border-violet-900/60 pt-4 text-sm">
            <p className="font-semibold text-white">{admin?.fullName || admin?.email}</p>
            <p className="text-violet-300/70">{admin?.role}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 text-left text-violet-200 underline-offset-2 hover:underline"
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-violet-900/60 bg-[#12081f]/80 px-4 py-3 backdrop-blur md:px-8">
            <div className="md:hidden">
              <p className="text-sm font-bold">CV Admin</p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2 text-xs md:hidden">
              <NavLink to={CV_ADMIN_BASE} className="rounded bg-violet-900/50 px-2 py-1">
                CVs
              </NavLink>
              <NavLink to={`${CV_ADMIN_BASE}/documents`} className="rounded bg-violet-900/50 px-2 py-1">
                Docs
              </NavLink>
              <NavLink to={`${CV_ADMIN_BASE}/whatsapp`} className="rounded bg-violet-900/50 px-2 py-1">
                WA
              </NavLink>
              {isSuper ? (
                <NavLink to={`${CV_ADMIN_BASE}/admins`} className="rounded bg-violet-900/50 px-2 py-1">
                  Admins
                </NavLink>
              ) : null}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
