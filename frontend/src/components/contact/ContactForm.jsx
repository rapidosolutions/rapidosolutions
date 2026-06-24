import { useMemo, useState } from "react";
import { services } from "../../data/servicesData";
import Button from "../common/Button";
import Icon from "../ui/Icon";
import { submitContact } from "../../utils/blogApi";

const budgetOptions = ["Not sure yet", "Under $1,000", "$1,000 - $3,000", "$3,000 - $7,500", "$7,500+"];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "Not Sure Yet",
  budget: "Not sure yet",
  message: "",
  website: ""
};

const requiredFieldNames = ["name", "email", "message"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContactForm(form) {
  const nextErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();
  const message = form.message.trim();

  if (!name) {
    nextErrors.name = "Name is required.";
  } else if (name.length < 2) {
    nextErrors.name = "Name must be at least 2 characters.";
  }

  if (!email) {
    nextErrors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 16) {
      nextErrors.phone = "Enter a valid phone or WhatsApp number.";
    }
  }

  if (!message) {
    nextErrors.message = "Message is required.";
  } else if (message.length < 20) {
    nextErrors.message = "Please add at least 20 characters so we understand the request.";
  }

  return nextErrors;
}

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const serviceOptions = useMemo(
    () => [...services.map((service) => service.title), "Financial Services", "Not Sure Yet"],
    []
  );

  const validationErrors = useMemo(() => validateContactForm(form), [form]);
  const canSubmit = Object.keys(validationErrors).length === 0 && !submitting;
  const hasStarted = useMemo(
    () =>
      Object.entries(form).some(
        ([key, value]) => key !== "website" && value !== initialForm[key]
      ),
    [form]
  );

  const fieldError = (field) => (touched[field] || submitAttempted ? validationErrors[field] : "");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSubmitted(false);
    setServerError("");
  };

  const markTouched = (event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setTouched((current) =>
      requiredFieldNames.reduce((nextTouched, field) => ({ ...nextTouched, [field]: true }), {
        ...current,
        phone: Boolean(form.phone.trim())
      })
    );
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    setServerError("");
    submitContact(form)
      .then((data) => {
        setSuccessMessage(data.message || "Thanks. Your request was submitted successfully.");
        setSubmitted(true);
        setForm(initialForm);
        setTouched({});
        setSubmitAttempted(false);
        window.setTimeout(() => setSubmitted(false), 6000);
      })
      .catch((error) => {
        setSubmitted(false);
        setServerError(error.message || "Something went wrong. Please try again.");
      })
      .finally(() => setSubmitting(false));
  };

  const inputClasses =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-rapido-navy outline-none transition focus:border-rapido-blue focus:ring-4 focus:ring-blue-100";
  const invalidInputClasses = "border-rose-300 focus:border-rose-500 focus:ring-rose-100";
  const classesFor = (field) => `${inputClasses} ${fieldError(field) ? invalidInputClasses : ""}`;

  return (
    <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-premium md:p-8" onSubmit={onSubmit} noValidate>
      {submitted ? (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800" role="status">
          <Icon name="FiCheckCircle" className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="font-bold">{successMessage}</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-rapido-navy">Name</span>
          <input className={classesFor("name")} name="name" value={form.name} onChange={updateField} onBlur={markTouched} placeholder="Your name" autoComplete="name" aria-invalid={Boolean(fieldError("name"))} />
          {fieldError("name") ? <span className="text-sm font-bold text-rose-600">{fieldError("name")}</span> : null}
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-rapido-navy">Email</span>
          <input className={classesFor("email")} type="email" name="email" value={form.email} onChange={updateField} onBlur={markTouched} placeholder="you@company.com" autoComplete="email" aria-invalid={Boolean(fieldError("email"))} />
          {fieldError("email") ? <span className="text-sm font-bold text-rose-600">{fieldError("email")}</span> : null}
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-rapido-navy">Phone / WhatsApp</span>
          <input className={classesFor("phone")} type="tel" name="phone" value={form.phone} onChange={updateField} onBlur={markTouched} placeholder="+17542158222" autoComplete="tel" aria-invalid={Boolean(fieldError("phone"))} />
          {fieldError("phone") ? <span className="text-sm font-bold text-rose-600">{fieldError("phone")}</span> : null}
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-rapido-navy">Company</span>
          <input className={inputClasses} name="company" value={form.company} onChange={updateField} onBlur={markTouched} placeholder="Company name" autoComplete="organization" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-rapido-navy">Service Interest</span>
          <select className={inputClasses} name="service" value={form.service} onChange={updateField} onBlur={markTouched}>
            {serviceOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-rapido-navy">Budget Range</span>
          <select className={inputClasses} name="budget" value={form.budget} onChange={updateField} onBlur={markTouched}>
            {budgetOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-extrabold text-rapido-navy">Message</span>
          <textarea
            className={`${classesFor("message")} min-h-36 resize-y`}
            name="message"
            value={form.message}
            onChange={updateField}
            onBlur={markTouched}
            placeholder="Tell us about the website, store, SEO, maintenance, or financial support you need."
            aria-invalid={Boolean(fieldError("message"))}
          />
          {fieldError("message") ? <span className="text-sm font-bold text-rose-600">{fieldError("message")}</span> : null}
        </label>
      </div>

      <label className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        Website
        <input name="website" value={form.website} onChange={updateField} tabIndex={-1} autoComplete="off" />
      </label>

      {serverError ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800" role="alert">{serverError}</p> : null}

      {!canSubmit && hasStarted ? (
        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          Complete the required fields correctly to enable submission.
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" icon="FiSend" disabled={!canSubmit}>
        {submitting ? "Sending Request" : "Submit Project Request"}
      </Button>
    </form>
  );
}
