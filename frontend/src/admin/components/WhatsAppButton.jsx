import { Link } from "react-router-dom";
import { CV_ADMIN_BASE, logWhatsApp, whatsAppUrl } from "../lib/cvAdminApi";

export default function WhatsAppButton({ phone, name, cvId }) {
  const text = `Hello ${name || ""}, thank you for your application. We would like to discuss next steps with you.`;
  const digits = String(phone || "").replace(/\D/g, "");
  const portalHref = `${CV_ADMIN_BASE}/whatsapp?phone=${encodeURIComponent(digits)}&message=${encodeURIComponent(text)}${cvId ? `&cvId=${encodeURIComponent(cvId)}` : ""}`;

  async function handleClick() {
    if (!phone) return;
    window.open(whatsAppUrl(phone, text), "_blank", "noopener,noreferrer");
    if (cvId) {
      try {
        await logWhatsApp(cvId, text);
      } catch {
        /* non-blocking */
      }
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={!phone}
        onClick={handleClick}
        className="rounded-lg border border-emerald-700/70 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-950/40 disabled:opacity-40"
      >
        WhatsApp (wa.me)
      </button>
      <Link
        to={portalHref}
        className={`rounded-lg border border-violet-600 px-4 py-2 text-sm font-semibold text-violet-100 hover:bg-violet-900/40 ${!phone ? "pointer-events-none opacity-40" : ""}`}
      >
        Send via portal
      </Link>
    </div>
  );
}
