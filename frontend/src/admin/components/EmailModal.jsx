import { useState } from "react";

export default function EmailModal({ defaults, to, onClose, onSend }) {
  const [subject, setSubject] = useState(defaults.subject || "");
  const [message, setMessage] = useState(defaults.message || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSend({ subject, message, to });
    } catch (err) {
      setError(err.message || "Could not send email.");
      setLoading(false);
      return;
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl border border-violet-800 bg-[#12081f] p-6">
        <h3 className="text-xl font-bold text-white">Send email</h3>
        <p className="mt-1 text-sm text-violet-300/70">To: {to || "missing email"}</p>
        {error ? <p className="mt-3 rounded bg-red-950/50 px-3 py-2 text-sm text-red-200">{error}</p> : null}
        <label className="mt-4 block text-sm text-violet-100">
          Subject
          <input
            className="mt-1 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-white"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </label>
        <label className="mt-3 block text-sm text-violet-100">
          Message
          <textarea
            className="mt-1 min-h-40 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-white"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-violet-200">
            Cancel
          </button>
          <button type="submit" disabled={loading || !to} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
