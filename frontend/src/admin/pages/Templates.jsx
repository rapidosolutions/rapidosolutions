import { useEffect, useState } from "react";
import DocumentEditor from "../components/DocumentEditor";
import { listTemplates, updateTemplate } from "../lib/cvAdminApi";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [title, setTitle] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await listTemplates();
    setTemplates(data.templates || []);
    const first = data.templates?.[0];
    if (first) {
      setActiveId(first.id);
      setTitle(first.title);
      setBodyHtml(first.bodyHtml);
    }
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  function selectTemplate(template) {
    setActiveId(template.id);
    setTitle(template.title);
    setBodyHtml(template.bodyHtml);
    setNotice("");
  }

  async function save() {
    setError("");
    setNotice("");
    try {
      const { template } = await updateTemplate(activeId, { title, bodyHtml });
      setTemplates((prev) => prev.map((item) => (item.id === template.id ? template : item)));
      setNotice("Template saved.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Document templates</h2>
        <p className="text-sm text-violet-200/70">
          Placeholders: {"{{full_name}}"}, {"{{designation}}"}, {"{{department}}"}, {"{{date}}"}, {"{{joining_date}}"}, {"{{salary}}"}, {"{{conditions}}"}, {"{{college_name}}"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => selectTemplate(template)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              activeId === template.id ? "bg-violet-600 text-white" : "bg-violet-950 text-violet-200"
            }`}
          >
            {template.title}
          </button>
        ))}
      </div>

      {error ? <p className="text-red-300">{error}</p> : null}
      {notice ? <p className="text-emerald-300">{notice}</p> : null}

      {activeId ? (
        <div className="space-y-4">
          <input
            className="w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <DocumentEditor value={bodyHtml} onChange={setBodyHtml} />
          <button type="button" onClick={save} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white">
            Save template
          </button>
        </div>
      ) : null}
    </div>
  );
}
