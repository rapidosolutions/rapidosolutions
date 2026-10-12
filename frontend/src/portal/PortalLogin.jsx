import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiShield } from "react-icons/fi";
import { usePortal } from "./PortalContext";
import rapidoWordmark from "../assets/logo/rapido-wordmark-cropped.png";
import rapidoIcon from "../assets/logo/rapido-icon-new.png";

export default function PortalLogin() {
  const { login } = usePortal();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your administrator email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate("/admin");
    } catch (err) {
      setErrorMessage(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail("rapidosolutionsco@outlook.com");
    setPassword("AdminPassword123!");
    setErrorMessage("");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-rapido-navy font-sans text-white flex flex-col justify-between selection:bg-rapido-blue selection:text-white">
      {/* Background ambient light effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-rapido-blue/20 blur-[130px]" />
        <div className="absolute top-1/3 -right-32 h-[480px] w-[480px] rounded-full bg-rapido-sky/15 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-dark opacity-20" />
      </div>

      {/* Top Bar with Return Link */}
      <header className="relative z-10 w-full px-6 py-6 md:px-12 flex items-center justify-between">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold tracking-wide text-slate-300 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
        >
          <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Rapido Solutions</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Portal Gateway Online</span>
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[460px]"
        >
          {/* Card Container */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0c182c]/85 p-8 sm:p-10 shadow-[0_24px_70px_rgba(2,8,20,0.65)] backdrop-blur-2xl before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-rapido-sky before:to-transparent">
            {/* Logo & Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-5 flex items-center justify-center">
                <div className="absolute -inset-2 rounded-full bg-rapido-blue/25 blur-lg" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] p-2.5 shadow-inner backdrop-blur-xl">
                  <img
                    src={rapidoIcon}
                    alt="Rapido Icon"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Brand Wordmark */}
              <div className="mb-3">
                <img
                  src={rapidoWordmark}
                  alt="Rapido Solutions Co."
                  className="h-8 w-auto brightness-0 invert object-contain opacity-95"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-rapido-sky/30 bg-rapido-sky/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rapido-sky">
                <FiShield className="text-xs" />
                <span>Admin Portal</span>
              </div>

              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white font-display">
                Sign In to Portal
              </h1>
              <p className="mt-1.5 text-xs text-slate-400">
                Manage live portfolio projects & generate client proposals
              </p>
            </div>

            {/* Error Banner */}
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25 }}
                  role="alert"
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-200">
                    <FiAlertCircle className="mt-0.5 shrink-0 text-sm text-red-400" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Admin Email
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <FiMail className="text-base" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="admin@rapidosolutions.com"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-rapido-sky focus:bg-white/[0.08] focus:ring-2 focus:ring-rapido-sky/25"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                  >
                    Password
                  </label>
                </div>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <FiLock className="text-base" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-11 text-sm font-medium text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-rapido-sky focus:bg-white/[0.08] focus:ring-2 focus:ring-rapido-sky/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition hover:text-slate-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                  </button>
                </div>
              </div>

              {/* Options row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-rapido-blue accent-rapido-blue focus:ring-rapido-sky/30"
                  />
                  <span className="text-xs text-slate-300">Keep me signed in</span>
                </label>

                {/* Local Quick-fill button for fast local dev */}
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[11px] font-semibold text-rapido-sky/90 hover:text-rapido-sky underline decoration-dotted underline-offset-4 transition"
                >
                  Fill dev credentials
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-rapido-blue via-blue-600 to-rapido-sky px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:shadow-blue-500/40 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Authenticating…</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Admin Portal</span>
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security footnote */}
          <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <FiShield className="text-rapido-sky/80" />
            <span>256-Bit SSL Encrypted Admin Console</span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-5 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Rapido Solutions Co. All rights reserved.</p>
      </footer>
    </div>
  );
}
