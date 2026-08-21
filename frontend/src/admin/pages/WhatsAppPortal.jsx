import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  whatsappConnect,
  whatsappDisconnect,
  whatsappSend,
  whatsappStatus
} from "../lib/cvAdminApi";

export default function WhatsAppPortal() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({
    status: "disconnected",
    qrDataUrl: "",
    phoneNumber: "",
    lastError: "",
    recentMessages: []
  });
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [message, setMessage] = useState(searchParams.get("message") || "");
  const [cvId] = useState(searchParams.get("cvId") || "");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  async function refresh() {
    try {
      const data = await whatsappStatus();
      setState(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 2500);
    return () => clearInterval(timer);
  }, []);

  async function connect() {
    setBusy("connect");
    setError("");
    setNotice("");
    try {
      const data = await whatsappConnect();
      setState(data);
      setNotice("Session started. Scan the QR with WhatsApp on your company phone.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function disconnect() {
    setBusy("disconnect");
    setError("");
    try {
      const data = await whatsappDisconnect();
      setState(data);
      setNotice("WhatsApp session disconnected.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function send(event) {
    event.preventDefault();
    setBusy("send");
    setError("");
    setNotice("");
    try {
      const result = await whatsappSend({ phone, message, cvId: cvId || null });
      setState(result.status);
      setNotice(`Message sent to ${phone}.`);
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  const statusColor =
    state.status === "connected"
      ? "text-emerald-300"
      : state.status === "qr" || state.status === "connecting"
        ? "text-amber-300"
        : "text-violet-300";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">WhatsApp portal</h2>
        <p className="mt-1 max-w-2xl text-sm text-violet-200/70">
          Scan once with your company WhatsApp (Linked devices), then send messages from this console. Uses Baileys
          (unofficial WhatsApp Web). Keep the phone online. Prefer official WhatsApp Business API for high-volume
          production.
        </p>
      </div>

      {error ? <p className="rounded-lg bg-red-950/50 px-4 py-3 text-sm text-red-200">{error}</p> : null}
      {notice ? <p className="rounded-lg bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">{notice}</p> : null}
      {state.lastError ? (
        <p className="rounded-lg bg-amber-950/40 px-4 py-3 text-sm text-amber-100">{state.lastError}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-violet-900/60 bg-[#12081f] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-violet-300/70">Connection</p>
              <p className={`mt-1 text-lg font-bold capitalize ${statusColor}`}>{state.status}</p>
              {state.phoneNumber ? (
                <p className="mt-1 text-sm text-violet-200/80">Linked: +{state.phoneNumber}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={Boolean(busy) || state.status === "connected"}
                onClick={connect}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                {busy === "connect" ? "Starting…" : "Connect / Show QR"}
              </button>
              <button
                type="button"
                disabled={Boolean(busy) || state.status === "disconnected"}
                onClick={disconnect}
                className="rounded-lg border border-violet-700 px-4 py-2 text-sm font-semibold text-violet-100 disabled:opacity-40"
              >
                {busy === "disconnect" ? "…" : "Logout"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-violet-800 bg-[#0b0618] p-4">
            {state.status === "qr" && state.qrDataUrl ? (
              <div className="text-center">
                <img src={state.qrDataUrl} alt="WhatsApp QR code" className="mx-auto rounded-lg bg-white p-3" />
                <p className="mt-3 text-sm text-violet-200/80">
                  WhatsApp → Linked devices → Link a device → scan this code
                </p>
              </div>
            ) : state.status === "connected" ? (
              <p className="text-center text-emerald-200">Connected. You can send messages from the form.</p>
            ) : state.status === "connecting" ? (
              <p className="text-violet-200/80">Starting WhatsApp session…</p>
            ) : (
              <p className="text-center text-violet-300/70">Click Connect to generate a QR code.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-violet-900/60 bg-[#12081f] p-5">
          <h3 className="font-bold text-white">Send message</h3>
          <form onSubmit={send} className="mt-4 space-y-3">
            <label className="block text-sm text-violet-100">
              Phone (with country code, e.g. 923001234567)
              <input
                className="mt-1 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="923001234567"
                required
              />
            </label>
            <label className="block text-sm text-violet-100">
              Message
              <textarea
                className="mt-1 min-h-36 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-white"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              disabled={busy === "send" || state.status !== "connected"}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              {busy === "send" ? "Sending…" : "Send WhatsApp"}
            </button>
          </form>

          <h3 className="mt-8 font-bold text-white">Recent sends</h3>
          <ul className="mt-3 max-h-64 space-y-2 overflow-auto text-sm">
            {(state.recentMessages || []).length === 0 ? (
              <li className="text-violet-300/60">No messages yet this session.</li>
            ) : (
              state.recentMessages.map((item) => (
                <li key={item.id} className="rounded-lg bg-[#0b0618] p-3 text-violet-100">
                  <div className="flex justify-between gap-2 text-xs text-violet-300/70">
                    <span>+{item.phone}</span>
                    <span>{new Date(item.sentAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap">{item.message}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
