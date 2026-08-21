import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CV_ADMIN_BASE, cvAdminLogin } from "../lib/cvAdminApi";
import rapidoLogo from "../../../Logos PNGs/2.png";

/** Sharp vector mark matching Rapido's blue "R" icon — avoids blurry PNG upscaling. */
function RapidoMark({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rmFill" x1="40" y1="28" x2="200" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5BA8FF" />
          <stop offset="0.55" stopColor="#2F7BFF" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="rmSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1D4ED8" floodOpacity="0.45" />
        </filter>
      </defs>
      <g filter="url(#rmSoft)">
        {/* Top hook bar */}
        <path
          d="M46 52h92c34 0 56 22 56 52 0 22-12 40-34 48l-30 10c-5 1.8-9-2.4-7-7l14-38c5-14 2-24-12-28H46c-10 0-18-8-18-18s8-19 18-19Z"
          fill="url(#rmFill)"
        />
        {/* Diagonal leg */}
        <rect
          x="112"
          y="92"
          width="34"
          height="128"
          rx="17"
          transform="rotate(-40 129 156)"
          fill="url(#rmFill)"
        />
        {/* Accent dot */}
        <circle cx="68" cy="168" r="20" fill="url(#rmFill)" />
      </g>
    </svg>
  );
}

export default function Login({ onSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await cvAdminLogin({ email, password });
      onSuccess?.(data);
      if (data.requires2fa) navigate(`${CV_ADMIN_BASE}/verify-2fa`);
      else navigate(CV_ADMIN_BASE);
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#1e1035] via-[#3b0764] to-[#0b0618] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(167,139,250,.35),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(91,33,182,.4),transparent_40%)]" />
        <div className="relative flex flex-1 flex-col">
          <p className="text-sm uppercase tracking-[0.25em] text-violet-200/80">Private console</p>
          <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight">CV Administration</h1>
          <p className="mt-4 max-w-sm text-violet-100/80">
            Review applicants, contact candidates, and generate official letters from one secure workspace.
          </p>

          <div className="relative mx-auto mt-auto flex h-72 w-72 items-center justify-center xl:h-[22rem] xl:w-[22rem]">
            <div className="pointer-events-none absolute inset-10 rounded-full bg-blue-500/30 blur-3xl" />

            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 90deg, transparent 0%, rgba(96,165,250,0.8) 14%, transparent 30%, transparent 58%, rgba(167,139,250,0.55) 72%, transparent 88%)"
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-[2px] rounded-full bg-[#12081f]/85 backdrop-blur-sm" />

            <motion.div
              className="absolute inset-5 rounded-full border-2 border-dashed border-sky-300/55"
              animate={{ rotate: -360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              className="absolute inset-12 rounded-full border border-violet-200/45"
              animate={{ scale: [1, 1.07, 1], opacity: [0.4, 0.95, 0.4] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="relative z-10 h-40 w-40 xl:h-48 xl:w-48"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <RapidoMark className="h-full w-full" />
            </motion.div>
          </div>
        </div>

        <div className="relative mt-10 flex items-center gap-3 border-t border-violet-500/20 pt-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/90">Restricted access</p>
            <p className="mt-0.5 text-sm text-violet-100/75">Unauthorized use of this console is prohibited and monitored.</p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#0b0618] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-2xl bg-white px-5 py-3 shadow-lg shadow-violet-950/40">
              <img
                src={rapidoLogo}
                alt="Rapido Solutions Co."
                className="h-12 w-auto max-w-[280px] object-contain"
              />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-violet-900/70 bg-[#12081f] p-8 shadow-2xl shadow-violet-950/40"
          >
            <h2 className="text-2xl font-bold text-white">Sign in</h2>
            <p className="mt-2 text-sm text-violet-200/70">Email and password for authorized administrators only.</p>

            {error ? <p className="mt-4 rounded-lg bg-red-950/60 px-3 py-2 text-sm text-red-200">{error}</p> : null}

            <label className="mt-6 block text-sm font-semibold text-violet-100">
              Email
              <input
                className="mt-2 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-4 py-3 text-white outline-none focus:border-violet-500"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="mt-4 block text-sm font-semibold text-violet-100">
              Password
              <input
                className="mt-2 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-4 py-3 text-white outline-none focus:border-violet-500"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={10}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-500 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Continue"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
