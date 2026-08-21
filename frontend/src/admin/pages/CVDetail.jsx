import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmailModal from "../components/EmailModal";
import WhatsAppButton from "../components/WhatsAppButton";
import { CV_ADMIN_BASE, getCv, sendCvEmail, updateCvStatus } from "../lib/cvAdminApi";

export default function CVDetail() {
  const { id } = useParams();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  async function load() {
    try {
      setPayload(await getCv(id));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const cv = payload?.cv;
  const defaultEmail = useMemo(() => {
    if (!cv) return { subject: "", message: "" };
    return {
      subject: `Regarding your application — ${cv.designation || "opportunity"}`,
      message: `Hello ${cv.fullName || "there"},\n\nThank you for your interest. Our team reviewed your profile and would like to continue the conversation.\n\nBest regards`
    };
  }, [cv]);

  async function changeStatus(status) {
    setStatusSaving(true);
    try {
      const { cv: updated } = await updateCvStatus(id, status);
      setPayload((prev) => ({ ...prev, cv: updated }));
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusSaving(false);
    }
  }

  if (error && !cv) return <p className="text-red-300">{error}</p>;
  if (!cv) return <p className="text-violet-200/70">Loading…</p>;

  return (
    <div className="space-y-6">
      <Link to={CV_ADMIN_BASE} className="text-sm text-violet-300 hover:text-white">
        ← Back to dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{cv.fullName}</h2>
          <p className="text-violet-200/70">
            {cv.designation || "No designation"} · {cv.category} · Score {cv.cvScore ?? "—"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <WhatsAppButton phone={cv.phone} name={cv.fullName} cvId={cv.id} />
          <button
            type="button"
            onClick={() => setEmailOpen(true)}
            className="rounded-lg border border-violet-700 px-4 py-2 text-sm font-semibold text-violet-100 hover:bg-violet-900/50"
          >
            Send Email
          </button>
          <Link
            to={`${CV_ADMIN_BASE}/documents?cvId=${cv.id}`}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500"
          >
            Generate Document
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-violet-900/60 bg-[#12081f] p-5">
          <h3 className="font-bold text-white">Candidate</h3>
          <dl className="mt-3 space-y-2 text-sm text-violet-100">
            <div><dt className="text-violet-300/70">Email</dt><dd>{cv.email || "—"}</dd></div>
            <div><dt className="text-violet-300/70">Phone</dt><dd>{cv.phone || "—"}</dd></div>
            <div><dt className="text-violet-300/70">Source</dt><dd>{cv.source}</dd></div>
            <div>
              <dt className="text-violet-300/70">Status</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {["new", "shortlisted", "hired", "rejected"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={statusSaving}
                    onClick={() => changeStatus(status)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      cv.status === status ? "bg-violet-600 text-white" : "bg-violet-950 text-violet-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </dd>
            </div>
          </dl>
          <h3 className="mt-6 font-bold text-white">Gemini summary</h3>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-[#0b0618] p-3 text-xs text-violet-100/90">
            {cv.geminiSummary || "No summary stored."}
          </pre>
        </section>

        <section className="rounded-2xl border border-violet-900/60 bg-[#12081f] p-5">
          <h3 className="font-bold text-white">CV preview</h3>
          {cv.cvUrl ? (
            <iframe title="CV preview" src={cv.cvUrl} className="mt-3 h-[28rem] w-full rounded-lg bg-white" />
          ) : (
            <p className="mt-3 text-sm text-violet-200/70">No file attached (manual entry or sample).</p>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-violet-900/60 bg-[#12081f] p-5">
        <h3 className="font-bold text-white">Communications</h3>
        <ul className="mt-3 space-y-2 text-sm text-violet-100">
          {(payload.communications || []).length === 0 ? <li className="text-violet-300/60">None yet.</li> : null}
          {(payload.communications || []).map((item) => (
            <li key={item.id} className="rounded-lg bg-[#0b0618] p-3">
              <div className="flex justify-between gap-2 text-xs text-violet-300/70">
                <span className="uppercase">{item.type}</span>
                <span>{new Date(item.sentAt).toLocaleString()}</span>
              </div>
              {item.subject ? <p className="font-semibold">{item.subject}</p> : null}
              <p className="whitespace-pre-wrap text-violet-100/90">{item.message}</p>
            </li>
          ))}
        </ul>
      </section>

      {emailOpen ? (
        <EmailModal
          defaults={defaultEmail}
          to={cv.email}
          onClose={() => setEmailOpen(false)}
          onSend={async (body) => {
            await sendCvEmail(cv.id, body);
            setEmailOpen(false);
            await load();
          }}
        />
      ) : null}
    </div>
  );
}
