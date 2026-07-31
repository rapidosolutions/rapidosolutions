import { useState } from "react";
import Button from "../common/Button";
import Icon from "../ui/Icon";

const emptyWork = () => ({ jobTitle: "", company: "", startDate: "", endDate: "", achievements: "" });
const emptyEducation = () => ({ degree: "", institution: "", graduationDate: "" });

const inputClass = "mt-2 min-h-12 w-full rounded-lg border border-rapido-line bg-white px-4 text-rapido-navy outline-none transition focus:border-rapido-blue focus:ring-2 focus:ring-blue-100";
const labelClass = "text-sm font-bold text-rapido-navy";

function Field({ label, name, value, onChange, type = "text", required = false, placeholder = "" }) {
  return (
    <label className={labelClass}>
      {label}{required ? <span className="text-red-600"> *</span> : null}
      <input className={inputClass} type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} />
    </label>
  );
}

export default function ResumeBuilderForm({ onGenerate, pending }) {
  const [skillError, setSkillError] = useState("");
  const [form, setForm] = useState({
    personalInfo: { name: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" },
    targetRole: "",
    professionalSummary: "",
    workExperience: [emptyWork()],
    education: [emptyEducation()],
    skills: "",
    certifications: ""
  });

  const updatePersonal = (event) => setForm((current) => ({ ...current, personalInfo: { ...current.personalInfo, [event.target.name]: event.target.value } }));
  const updateList = (key, index, field, value) => setForm((current) => ({
    ...current,
    [key]: current[key].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
  }));
  const addItem = (key) => setForm((current) => ({ ...current, [key]: [...current[key], key === "workExperience" ? emptyWork() : emptyEducation()] }));
  const removeItem = (key, index) => setForm((current) => ({ ...current, [key]: current[key].filter((_, itemIndex) => itemIndex !== index) }));

  const submit = (event) => {
    event.preventDefault();
    const skills = form.skills.split(",").map((item) => item.trim()).filter(Boolean);

    if (skills.length < 3) {
      setSkillError("Enter at least three skills separated by commas.");
      return;
    }

    setSkillError("");
    onGenerate({
      ...form,
      skills,
      certifications: form.certifications.split(",").map((item) => item.trim()).filter(Boolean)
    });
  };

  return (
    <form className="rounded-lg border border-rapido-line bg-white p-5 shadow-premium sm:p-7" onSubmit={submit}>
      <fieldset>
        <legend className="font-display text-xl font-extrabold text-rapido-navy">Personal information</legend>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Full name" name="name" value={form.personalInfo.name} onChange={updatePersonal} required />
          <Field label="Email" name="email" type="email" value={form.personalInfo.email} onChange={updatePersonal} required />
          <Field label="Phone" name="phone" value={form.personalInfo.phone} onChange={updatePersonal} />
          <Field label="Location" name="location" value={form.personalInfo.location} onChange={updatePersonal} />
          <Field label="LinkedIn" name="linkedin" value={form.personalInfo.linkedin} onChange={updatePersonal} placeholder="linkedin.com/in/your-profile" />
          <Field label="Portfolio" name="portfolio" value={form.personalInfo.portfolio} onChange={updatePersonal} placeholder="yourportfolio.com" />
        </div>
      </fieldset>

      <fieldset className="mt-8 border-t border-rapido-line pt-7">
        <legend className="font-display text-xl font-extrabold text-rapido-navy">Professional direction</legend>
        <div className="mt-5 grid gap-4">
          <Field label="Target role" name="targetRole" value={form.targetRole} onChange={(event) => setForm((current) => ({ ...current, targetRole: event.target.value }))} required />
          <label className={labelClass}>Professional summary
            <textarea className={`${inputClass} min-h-28 py-3`} value={form.professionalSummary} onChange={(event) => setForm((current) => ({ ...current, professionalSummary: event.target.value }))} />
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-8 border-t border-rapido-line pt-7">
        <div className="flex items-center justify-between gap-3">
          <legend className="font-display text-xl font-extrabold text-rapido-navy">Work experience</legend>
          <Button size="sm" variant="secondary" icon="FiPlus" onClick={() => addItem("workExperience")}>Add role</Button>
        </div>
        <div className="mt-5 space-y-5">
          {form.workExperience.map((entry, index) => (
            <div key={`work-${index}`} className="rounded-lg bg-rapido-mist p-4 sm:p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Job title" value={entry.jobTitle} onChange={(event) => updateList("workExperience", index, "jobTitle", event.target.value)} required />
                <Field label="Company" value={entry.company} onChange={(event) => updateList("workExperience", index, "company", event.target.value)} required />
                <Field label="Start date" value={entry.startDate} onChange={(event) => updateList("workExperience", index, "startDate", event.target.value)} required placeholder="Jan 2023" />
                <Field label="End date" value={entry.endDate} onChange={(event) => updateList("workExperience", index, "endDate", event.target.value)} placeholder="Present" />
              </div>
              <label className={`${labelClass} mt-4 block`}>Achievements and responsibilities <span className="text-red-600">*</span>
                <textarea className={`${inputClass} min-h-28 py-3`} value={entry.achievements} onChange={(event) => updateList("workExperience", index, "achievements", event.target.value)} required placeholder="Add one achievement or responsibility per line." />
              </label>
              {form.workExperience.length > 1 ? <button className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500" type="button" onClick={() => removeItem("workExperience", index)}><Icon name="FiMinus" />Remove role</button> : null}
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8 border-t border-rapido-line pt-7">
        <div className="flex items-center justify-between gap-3">
          <legend className="font-display text-xl font-extrabold text-rapido-navy">Education</legend>
          <Button size="sm" variant="secondary" icon="FiPlus" onClick={() => addItem("education")}>Add education</Button>
        </div>
        <div className="mt-5 space-y-5">
          {form.education.map((entry, index) => (
            <div key={`education-${index}`} className="rounded-lg bg-rapido-mist p-4 sm:p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Degree" value={entry.degree} onChange={(event) => updateList("education", index, "degree", event.target.value)} required />
                <Field label="Institution" value={entry.institution} onChange={(event) => updateList("education", index, "institution", event.target.value)} required />
                <Field label="Graduation date" value={entry.graduationDate} onChange={(event) => updateList("education", index, "graduationDate", event.target.value)} required />
              </div>
              {form.education.length > 1 ? <button className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500" type="button" onClick={() => removeItem("education", index)}><Icon name="FiMinus" />Remove education</button> : null}
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8 border-t border-rapido-line pt-7">
        <legend className="font-display text-xl font-extrabold text-rapido-navy">Skills and certifications</legend>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className={labelClass}>Skills <span className="text-red-600">*</span>
            <textarea
              aria-describedby="resume-skills-help resume-skills-error"
              aria-invalid={Boolean(skillError)}
              className={`${inputClass} min-h-28 py-3`}
              value={form.skills}
              onChange={(event) => {
                setForm((current) => ({ ...current, skills: event.target.value }));
                if (skillError) setSkillError("");
              }}
              required
              placeholder="React, JavaScript, Technical SEO"
            />
            <span id="resume-skills-help" className="mt-2 block text-xs font-medium text-rapido-slate">Enter at least three, separated by commas.</span>
            {skillError ? <span id="resume-skills-error" className="mt-2 block text-sm font-semibold text-red-700" role="alert">{skillError}</span> : null}
          </label>
          <label className={labelClass}>Certifications
            <textarea className={`${inputClass} min-h-28 py-3`} value={form.certifications} onChange={(event) => setForm((current) => ({ ...current, certifications: event.target.value }))} placeholder="Certification name, another certification" />
          </label>
        </div>
      </fieldset>

      <Button className="mt-8 w-full sm:w-auto" type="submit" icon="FiZap" disabled={pending}>
        {pending ? "Building Resume..." : "Build ATS Resume"}
      </Button>
    </form>
  );
}
