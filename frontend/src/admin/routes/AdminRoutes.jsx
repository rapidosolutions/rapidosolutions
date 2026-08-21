import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  CV_ADMIN_BASE,
  cvAdminSession,
  getBranding,
  setCvAdminCsrf
} from "../lib/cvAdminApi";
import AdminShell from "../components/AdminShell";
import Login from "../pages/Login";
import Verify2FA from "../pages/Verify2FA";
import Dashboard from "../pages/Dashboard";
import CVDetail from "../pages/CVDetail";
import Templates from "../pages/Templates";
import GenerateDocument from "../pages/GenerateDocument";
import ManageAdmins from "../pages/ManageAdmins";
import BrandingSettings from "../pages/BrandingSettings";
import Security2FA from "../pages/Security2FA";
import WhatsAppPortal from "../pages/WhatsAppPortal";
import { usePageMeta } from "../../utils/usePageMeta";

function Protected({ admin, children }) {
  if (!admin) return <Navigate to={`${CV_ADMIN_BASE}/login`} replace />;
  return children;
}

function SuperOnly({ admin, children }) {
  if (admin?.role !== "super_admin") return <Navigate to={CV_ADMIN_BASE} replace />;
  return children;
}

export default function AdminRoutes() {
  const [admin, setAdmin] = useState(null);
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pending2fa, setPending2fa] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  usePageMeta("CV Admin", "Private CV administration console.", {
    canonicalPath: CV_ADMIN_BASE,
    robots: "noindex, nofollow"
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await cvAdminSession();
        if (!cancelled) {
          setAdmin(data.admin);
          setCvAdminCsrf(data.csrfToken);
          const brand = await getBranding().catch(() => null);
          if (!cancelled) setBranding(brand?.branding || null);
        }
      } catch {
        if (!cancelled) setAdmin(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSessionChecked(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !sessionChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0618] text-violet-200">
        Loading secure console…
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="login"
        element={
          admin ? (
            <Navigate to={CV_ADMIN_BASE} replace />
          ) : (
            <Login
              onSuccess={(data) => {
                if (data.requires2fa) {
                  setPending2fa(true);
                } else {
                  setAdmin(data.admin);
                  setPending2fa(false);
                }
              }}
            />
          )
        }
      />
      <Route
        path="verify-2fa"
        element={
          admin ? (
            <Navigate to={CV_ADMIN_BASE} replace />
          ) : (
            <Verify2FA
              enabled={pending2fa}
              onSuccess={(data) => {
                setAdmin(data.admin);
                setPending2fa(false);
              }}
            />
          )
        }
      />
      <Route
        element={
          <Protected admin={admin}>
            <AdminShell admin={admin} branding={branding} onLogout={() => setAdmin(null)} />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="cvs/:id" element={<CVDetail />} />
        <Route path="documents" element={<GenerateDocument />} />
        <Route path="whatsapp" element={<WhatsAppPortal />} />
        <Route path="security" element={<Security2FA admin={admin} />} />
        <Route
          path="templates"
          element={
            <SuperOnly admin={admin}>
              <Templates />
            </SuperOnly>
          }
        />
        <Route
          path="branding"
          element={
            <SuperOnly admin={admin}>
              <BrandingSettings onSaved={setBranding} />
            </SuperOnly>
          }
        />
        <Route
          path="admins"
          element={
            <SuperOnly admin={admin}>
              <ManageAdmins />
            </SuperOnly>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={admin ? CV_ADMIN_BASE : `${CV_ADMIN_BASE}/login`} replace />} />
    </Routes>
  );
}
