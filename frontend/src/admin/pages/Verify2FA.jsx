import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CV_ADMIN_BASE, cvAdminVerify2fa } from "../lib/cvAdminApi";

export default function Verify2FA({ enabled, onSuccess }) {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!enabled) return <Navigate to={`${CV_ADMIN_BASE}/login`} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await cvAdminVerify2fa(token);
      onSuccess?.(data);
      navigate(CV_ADMIN_BASE);
    } catch (err) {
      setError(err.message || "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0618] px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-violet-900/70 bg-[#12081f] p-8">
        <h1 className="text-2xl font-bold text-white">Two-factor authentication</h1>
        <p className="mt-2 text-sm text-violet-200/70">Enter the 6-digit code from your authenticator app.</p>
        {error ? <p className="mt-4 rounded-lg bg-red-950/60 px-3 py-2 text-sm text-red-200">{error}</p> : null}
        <input
          className="mt-6 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-4 py-3 text-center text-2xl tracking-[0.4em] text-white outline-none focus:border-violet-500"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={token}
          onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || token.length !== 6}
          className="mt-6 w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      </form>
    </div>
  );
}
