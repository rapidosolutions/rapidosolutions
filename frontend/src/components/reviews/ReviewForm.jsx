import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../common/Button";
import Icon from "../ui/Icon";
import ModernDropdown from "../ui/ModernDropdown";
import { submitReview } from "../../utils/blogApi";

const SERVICE_OPTIONS = [
  "Web Services",
  "Shopify Stores",
  "WordPress Websites",
  "Business Websites",
  "Restaurant Websites",
  "Real Estate Websites",
  "SaaS Landing Pages",
  "UI/UX Improvements",
  "SEO/Performance Projects",
  "Bookkeeping & Finance",
  "Human Resource Services",
  "General Experience"
];

const initialForm = {
  name: "",
  email: "",
  company: "",
  role: "",
  service: "Web Services",
  projectName: "",
  rating: 5,
  review: "",
  consent: false,
  website: ""
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-rapido-navy outline-none transition focus:border-rapido-blue focus:ring-2 focus:ring-blue-100";

function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email address.";
  if (!form.service) errors.service = "Choose the service or category you used.";
  if (form.rating < 1 || form.rating > 5) errors.rating = "Choose a rating from 1 to 5.";
  if (form.review.trim().length < 20) errors.review = "Write at least 20 characters.";
  if (!form.consent) errors.consent = "Confirm that Rapido may publish this review.";
  return errors;
}

export default function ReviewForm({ onReviewSubmitted = null }) {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill from query params if client arrived via "Review This Project"
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    const projectParam = searchParams.get("project");

    if (serviceParam || projectParam) {
      setForm((prev) => ({
        ...prev,
        service: serviceParam || prev.service,
        projectName: projectParam || prev.projectName
      }));
    }
  }, [searchParams]);

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
      const response = await submitReview({
        ...form,
        review: form.review.trim()
      });

      const submittedRecord = response.review || {
        id: response.reference || `temp-${Date.now()}`,
        name: form.name.trim(),
        company: form.company.trim(),
        role: form.role.trim(),
        service: form.service,
        projectName: form.projectName.trim(),
        rating: form.rating,
        review: form.review.trim(),
        approvedAt: new Date().toISOString()
      };

      setStatus({
        type: "success",
        message: response.message || "Thank you! Your review has been added to All Reviews."
      });

      if (onReviewSubmitted) {
        onReviewSubmitted(submittedRecord);
      }

      setForm(initialForm);

      // Smooth scroll to all reviews section so the user sees their review immediately
      requestAnimationFrame(() => {
        const target = document.getElementById("all-reviews");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  const queryProject = searchParams.get("project");
  const queryService = searchParams.get("service");

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto max-w-3xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-premium sm:p-8"
    >
      {/* Group / Project Notice if pre-filled */}
      {queryProject || queryService ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs sm:text-sm font-semibold text-rapido-navy">
          <Icon name="FiStar" className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <span className="font-extrabold text-rapido-blue">Client Review Mode: </span>
            You are sharing feedback for{" "}
            <strong>{queryProject || queryService}</strong>
            {queryService && queryProject ? ` (${queryService})` : ""}.
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
          Name <span aria-hidden="true">*</span>
          <input
            className={inputClass}
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <span className="text-xs text-red-600 font-semibold">{errors.name}</span> : null}
        </label>

        <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
          Email <span aria-hidden="true">*</span>
          <input
            className={inputClass}
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={Boolean(errors.email)}
          />
          <span className={errors.email ? "text-xs text-red-600 font-semibold" : "text-xs font-semibold text-rapido-slate"}>
            {errors.email || "Kept private and used only for verification."}
          </span>
        </label>

        <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
          Company <span className="font-semibold text-rapido-slate">(optional)</span>
          <input
            className={inputClass}
            value={form.company}
            onChange={(event) => update("company", event.target.value)}
            autoComplete="organization"
            placeholder="e.g. Apex Global"
          />
        </label>

        <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
          Role <span className="font-semibold text-rapido-slate">(optional)</span>
          <input
            className={inputClass}
            value={form.role}
            onChange={(event) => update("role", event.target.value)}
            autoComplete="organization-title"
            placeholder="e.g. Founder &amp; CEO"
          />
        </label>

        {/* Modern Dropdown for Service Group */}
        <div className="sm:col-span-2">
          <label className="block mb-2 text-sm font-extrabold text-rapido-navy">
            Service Group / Category <span aria-hidden="true">*</span>
          </label>
          <ModernDropdown
            options={SERVICE_OPTIONS}
            value={form.service}
            onChange={(val) => update("service", val)}
            placeholder="Choose the service group"
          />
          {errors.service ? <span className="text-xs text-red-600 font-semibold mt-1 block">{errors.service}</span> : null}
        </div>

        {/* Specific Project Name Field */}
        <label className="grid gap-2 text-sm font-extrabold text-rapido-navy sm:col-span-2">
          Specific Project Name <span className="font-semibold text-rapido-slate">(optional)</span>
          <input
            className={inputClass}
            value={form.projectName}
            onChange={(event) => update("projectName", event.target.value)}
            placeholder="e.g. Shopify Skincare Store or custom project name"
          />
        </label>
      </div>

      {/* Star Rating Selection */}
      <fieldset className="mt-5">
        <legend className="text-sm font-extrabold text-rapido-navy">
          Rating <span aria-hidden="true">*</span>
        </legend>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => update("rating", rating)}
              aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
              className="rounded-lg p-2 transition hover:bg-amber-50 focus:outline-none"
            >
              <Icon
                name="FiStar"
                className={`h-7 w-7 transition-transform hover:scale-110 ${
                  rating <= form.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 grid gap-2 text-sm font-extrabold text-rapido-navy">
        Your Review <span aria-hidden="true">*</span>
        <textarea
          className={`${inputClass} min-h-36 resize-y leading-relaxed`}
          value={form.review}
          onChange={(event) => update("review", event.target.value)}
          maxLength={2000}
          placeholder="Share your experience working with Rapido Solutions Co..."
          aria-invalid={Boolean(errors.review)}
        />
        <span className={errors.review ? "text-xs text-red-600 font-semibold" : "text-xs font-semibold text-rapido-slate"}>
          {errors.review || `${form.review.length}/2000 characters`}
        </span>
      </label>

      <label className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-xs sm:text-sm font-semibold leading-relaxed text-rapido-slate border border-slate-200">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(event) => update("consent", event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded text-rapido-blue focus:ring-rapido-blue"
        />
        <span>
          I confirm this is my honest experience and allow Rapido Solutions Co. to publish my name, optional company/role,
          rating, and review. My email will remain private.
        </span>
      </label>
      {errors.consent ? <p className="mt-2 text-xs text-red-600 font-semibold">{errors.consent}</p> : null}

      {/* Honeypot field for bot protection */}
      <label className="sr-only" aria-hidden="true">
        Website
        <input tabIndex="-1" autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} />
      </label>

      {status.message ? (
        <p
          role="status"
          className={`mt-5 rounded-xl p-4 text-sm font-bold ${
            status.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <Button type="submit" icon="FiSend" className="mt-6 w-full sm:w-auto shadow-sm" disabled={submitting || !isValid}>
        {submitting ? "Submitting Review..." : "Submit Client Review"}
      </Button>
    </form>
  );
}
