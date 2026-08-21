import { useState } from "react";
import { confirm2fa, setup2fa } from "../lib/cvAdminApi";

export default function Security2FA({ admin }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function startSetup() {
    setError("");
    setNotice("");
    try {
      const data = await setup2fa();
      setQrDataUrl(data.qrDataUrl);
      setSecret(data.secret);
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirm(event) {
    event.preventDefault();
    setError("");
    try {
      await confirm2fa(token);
      setNotice("Two-factor authentication is enabled for this account.");
      setQrDataUrl("");
      setSecret("");
      setToken("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Security / 2FA</h2>
        <p className="text-sm text-violet-200/70">Signed in as {admin?.email}. Use an authenticator app (Google Authenticator, Authy, etc.).</p>
      </div>
      {error ? <p className="text-red-300">{error}</p> : null}
      {notice ? <p className="text-emerald-300">{notice}</p> : null}

      <button type="button" onClick={startSetup} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white">
        {qrDataUrl ? "Regenerate QR" : "Set up / rotate 2FA"}
      </button>

      {qrDataUrl ? (
        <form onSubmit={confirm} className="space-y-3 rounded-2xl border border-violet-900/60 bg-[#12081f] p-5">
          <img src={qrDataUrl} alt="TOTP QR code" className="mx-auto rounded-lg bg-white p-3" />
          <p className="break-all text-center text-xs text-violet-300/80">Manual secret: {secret}</p>
          <input
            className="w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-center tracking-[0.3em] text-white"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            required
          />
          <button type="submit" className="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white">
            Confirm &amp; enable
          </button>
        </form>
      ) : null}
    </div>
  );
}
