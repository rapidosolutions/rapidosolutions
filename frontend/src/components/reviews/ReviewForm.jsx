import { useMemo, useState } from "react";
import Button from "../common/Button";
import Icon from "../ui/Icon";
import { submitReview } from "../../utils/blogApi";

const initialForm = {
  name: "",
  email: "",
  company: "",
  role: "",
  service: "",
  rating: 0,
  review: "",
  consent: false,
  website: ""
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-rapido-navy outline-none transition focus:border-rapido-blue focus:ring-2 focus:ring-blue-100";

function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email address.";
  if (!form.service) errors.service = "Choose the service you used.";
  if (form.rating < 1 || form.rating > 5) errors.rating = "Choose a rating from 1 to 5.";
  if (form.review.trim().length < 20) errors.review = "Write at least 20 characters.";
  if (!form.consent) errors.consent = "Confirm that Rapido may publish this review.";
  return errors;
}

export default function ReviewForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const isValid = useMemo(() => Object.keys(validate(form)).length === 0, [form]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setStatus({ type: "", message: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const response = await submitReview({ ...form, review: form.review.trim() });
      setStatus({ type: "success", message: response.message });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-premium sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
          Name <span aria-hidden="true">*</span>
          <input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "review-name-error" : undefined} />
          {errors.name ? <span id="review-name-error" className="text-xs text-red-700">{errors.name}</span> : null}
        </label>
        <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
          Email <span aria-hidden="true">*</span>
          <input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby="review-email-help" />
          <span id="review-email-help" className={errors.email ? "text-xs text-red-700" : "text-xs font-semibold text-rapido-slate"}>{errors.email || "Kept private and used only for verification."}</span>
        </label>
        <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
          Company <span className="font-semibold text-rapido-slate">(optional)</span>
          <input className={inputClass} value={form.company} onChange={(event) => update("company", event.target.value)} autoComplete="organization" />
        </label>
        <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
          Role <span className="font-semibold text-rapido-slate">(optional)</span>
          <input className={inputClass} value={form.role} onChange={(event) => update("role", event.target.value)} autoComplete="organization-title" />
        </label>
        <label className="grid gap-2 text-sm font-extrabold text-rapido-navy sm:col-span-2">
          Service <span aria-hidden="true">*</span>
          <select className={inputClass} value={form.service} onChange={(event) => update("service", event.target.value)} aria-invalid={Boolean(errors.service)}>
            <option value="">Choose a service</option>
            <option>Web Services</option>
            <option>Bookkeeping &amp; Finance</option>
            <option>Human Resource Services</option>
            <option>General Experience</option>
          </select>
          {errors.service ? <span className="text-xs text-red-700">{errors.service}</span> : null}
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-extrabold text-rapido-navy">Rating <span aria-hidden="true">*</span></legend>
        <div className="mt-2 flex gap-2" aria-describedby={errors.rating ? "review-rating-error" : undefined}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <button key={rating} type="button" onClick={() => update("rating", rating)} aria-label={`${rating} star${rating === 1 ? "" : "s"}`} aria-pressed={form.rating === rating} className="rounded-md p-2 transition hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rapido-blue">
              <Icon name="FiStar" className={`h-7 w-7 ${rating <= form.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
            </button>
          ))}
        </div>
        {errors.rating ? <span id="review-rating-error" className="text-xs text-red-700">{errors.rating}</span> : null}
      </fieldset>

      <label className="mt-5 grid gap-2 text-sm font-extrabold text-rapido-navy">
        Your Review <span aria-hidden="true">*</span>
        <textarea className={`${inputClass} min-h-40 resize-y leading-7`} value={form.review} onChange={(event) => update("review", event.target.value)} maxLength={2000} aria-invalid={Boolean(errors.review)} />
        <span className={errors.review ? "text-xs text-red-700" : "text-xs font-semibold text-rapido-slate"}>{errors.review || `${form.review.length}/2000 characters`}</span>
      </label>

      <label className="mt-5 flex items-start gap-3 rounded-lg bg-rapido-mist p-4 text-sm font-semibold leading-6 text-rapido-slate">
        <input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
        <span>I confirm this is my honest experience and allow Rapido Solutions Co. to publish my name, optional company/role, rating, and review. My email will remain private.</span>
      </label>
      {errors.consent ? <p className="mt-2 text-xs text-red-700">{errors.consent}</p> : null}

      <label className="sr-only" aria-hidden="true">
        Website
        <input tabIndex="-1" autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} />
      </label>

      {status.message ? (
        <p role="status" className={`mt-5 rounded-lg p-4 text-sm font-bold ${status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
          {status.message}
        </p>
      ) : null}

      <Button type="submit" icon="FiSend" className="mt-6 w-full sm:w-auto" disabled={submitting || !isValid}>
        {submitting ? "Submitting Review" : "Submit Review"}
      </Button>
    </form>
  );
}
