export default function FiltersBar({ value, onChange, onClear }) {
  function set(key, next) {
    onChange({ ...value, [key]: next });
  }

  const field =
    "rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-sm text-white outline-none focus:border-violet-500";

  return (
    <div className="space-y-3 rounded-2xl border border-violet-900/60 bg-[#12081f] p-4">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        <input
          className={`${field} md:col-span-2`}
          placeholder="Search name, email, phone"
          value={value.search}
          onChange={(e) => set("search", e.target.value)}
        />
        <select className={field} value={value.status} onChange={(e) => set("status", e.target.value)}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          className={field}
          placeholder="Category"
          value={value.category}
          onChange={(e) => set("category", e.target.value)}
        />
        <input
          className={field}
          placeholder="Designation"
          value={value.designation}
          onChange={(e) => set("designation", e.target.value)}
        />
        <input
          className={field}
          type="number"
          min="0"
          max="10"
          step="0.1"
          placeholder="Min score"
          value={value.minScore}
          onChange={(e) => set("minScore", e.target.value)}
        />
        <input
          className={field}
          type="number"
          min="0"
          max="10"
          step="0.1"
          placeholder="Max score"
          value={value.maxScore}
          onChange={(e) => set("maxScore", e.target.value)}
        />
        <input className={field} type="date" value={value.fromDate} onChange={(e) => set("fromDate", e.target.value)} />
        <input className={field} type="date" value={value.toDate} onChange={(e) => set("toDate", e.target.value)} />
        <select className={field} value={value.sort} onChange={(e) => set("sort", e.target.value)}>
          <option value="newest">Sort: newest</option>
          <option value="score">Sort: score</option>
        </select>
      </div>
      <button type="button" onClick={onClear} className="text-sm font-semibold text-violet-300 hover:text-white">
        Clear filters
      </button>
    </div>
  );
}
