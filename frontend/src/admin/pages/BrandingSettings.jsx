import { useEffect, useState } from "react";
import { getBranding, updateBranding, uploadBrandingImage } from "../lib/cvAdminApi";

export default function BrandingSettings({ onSaved }) {
  const [form, setForm] = useState({
    collegeName: "",
    address: "",
    footerText: "",
    primaryColor: "#4c1d95",
    secondaryColor: "#1e1b4b",
    logoUrl: "",
    logoPublicId: "",
    signatureImageUrl: "",
    signaturePublicId: ""
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getBranding()
      .then((data) => {
        if (data.branding) setForm((prev) => ({ ...prev, ...data.branding }));
      })
      .catch((err) => setError(err.message));
  }, []);

  async function upload(kind, file) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { asset } = await uploadBrandingImage(file);
      if (kind === "logo") {
        setForm((prev) => ({ ...prev, logoUrl: asset.url, logoPublicId: asset.publicId }));
      } else {
        setForm((prev) => ({
          ...prev,
          signatureImageUrl: asset.url,
          signaturePublicId: asset.publicId
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { branding } = await updateBranding(form);
      setForm((prev) => ({ ...prev, ...branding }));
      onSaved?.(branding);
      setNotice("Branding saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const field = "mt-1 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-white";

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Branding settings</h2>
        <p className="text-sm text-violet-200/70">Injected into every generated document header and footer.</p>
      </div>
      {error ? <p className="text-red-300">{error}</p> : null}
      {notice ? <p className="text-emerald-300">{notice}</p> : null}

      <label className="block text-sm text-violet-100">
        Organization / college name
        <input className={field} value={form.collegeName} onChange={(e) => setForm({ ...form, collegeName: e.target.value })} />
      </label>
      <label className="block text-sm text-violet-100">
        Address
        <textarea className={field} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </label>
      <label className="block text-sm text-violet-100">
        Footer text
        <input className={field} value={form.footerText} onChange={(e) => setForm({ ...form, footerText: e.target.value })} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-violet-100">
          Primary color
          <input className={field} type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
        </label>
        <label className="block text-sm text-violet-100">
          Secondary color
          <input className={field} type="color" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} />
        </label>
      </div>
      <label className="block text-sm text-violet-100">
        Logo
        <input className="mt-2 block w-full text-sm" type="file" accept="image/*" onChange={(e) => upload("logo", e.target.files?.[0])} />
        {form.logoUrl ? <img src={form.logoUrl} alt="Logo" className="mt-2 h-16 object-contain" /> : null}
      </label>
      <label className="block text-sm text-violet-100">
        Signature image
        <input className="mt-2 block w-full text-sm" type="file" accept="image/*" onChange={(e) => upload("signature", e.target.files?.[0])} />
        {form.signatureImageUrl ? <img src={form.signatureImageUrl} alt="Signature" className="mt-2 h-16 object-contain" /> : null}
      </label>
      <button type="submit" disabled={busy} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
        {busy ? "Saving…" : "Save branding"}
      </button>
    </form>
  );
}
