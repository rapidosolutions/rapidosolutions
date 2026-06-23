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

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const serviceOptions = useMemo(
    () => [...services.map((service) => service.title), "Financial Services", "Not Sure Yet"],
    []
  );

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email.";
    if (!form.message.trim()) nextErrors.message = "Tell us what you need help with.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setServerError("");
    submitContact(form)
      .then((data) => {
        setSuccessMessage(data.message);
        setSubmitted(true);
        setForm(initialForm);
        window.setTimeout(() => setSubmitted(false), 6000);
      })
      .catch((error) => setServerError(error.message))
      .finally(() => setSubmitting(false));
  };

  const inputClasses =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-rapido-navy outline-none transition focus:border-rapido-blue focus:ring-4 focus:ring-blue-100";

  return (
    <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-premium md:p-8" onSubmit={onSubmit}>
      {submitted ? (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <Icon name="FiCheckCircle" className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="font-bold">{successMessage}</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-rapido-navy">Name</span>
          <input className={inputClasses} name="name" value={form.name} onChange={updateField} placeholder="Your name" autoComplete="name" required />
          {errors.name ? <span className="text-sm font-bold text-rose-600">{errors.name}</span> : null}
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-rapido-navy">Email</span>
          <input className={inputClasses} type="email" name="email" value={form.email} onChange={updateField} placeholder="you@company.com" autoComplete="email" required />
          {errors.email ? <span className="text-sm font-bold text-rose-600">{errors.email}</span> : null}
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-rapido-navy">Phone / WhatsApp</span>
          <input className={inputClasses} type="tel" name="phone" value={form.phone} onChange={updateField} placeholder="+92 331 3339840" autoComplete="tel" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-rapido-navy">Company</span>
          <input className={inputClasses} name="company" value={form.company} onChange={updateField} placeholder="Company name" autoComplete="organization" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-rapido-navy">Service Interest</span>
          <select className={inputClasses} name="service" value={form.service} onChange={updateField}>
            {serviceOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-rapido-navy">Budget Range</span>
          <select className={inputClasses} name="budget" value={form.budget} onChange={updateField}>
            {budgetOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-extrabold text-rapido-navy">Message</span>
          <textarea
            className={`${inputClasses} min-h-36 resize-y`}
            name="message"
            value={form.message}
            onChange={updateField}
            placeholder="Tell us about the website, store, SEO, maintenance, or financial support you need."
            required
          />
          {errors.message ? <span className="text-sm font-bold text-rose-600">{errors.message}</span> : null}
        </label>
      </div>

      <label className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        Website
        <input name="website" value={form.website} onChange={updateField} tabIndex={-1} autoComplete="off" />
      </label>

      {serverError ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">{serverError}</p> : null}

      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" icon="FiSend" disabled={submitting}>
        {submitting ? "Sending Request" : "Submit Project Request"}
      </Button>
    </form>
  );
}
