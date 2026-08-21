export default function DocumentEditor({ value, onChange }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <label className="block text-sm text-violet-100">
        HTML body
        <textarea
          className="mt-2 min-h-[28rem] w-full rounded-xl border border-violet-800 bg-[#0b0618] p-3 font-mono text-xs text-violet-50 outline-none focus:border-violet-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      <div>
        <p className="text-sm text-violet-100">Live preview</p>
        <div
          className="mt-2 min-h-[28rem] overflow-auto rounded-xl border border-violet-800 bg-white p-4 text-slate-900"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
    </div>
  );
}
