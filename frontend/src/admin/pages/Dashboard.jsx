import { useEffect, useState } from "react";
import FiltersBar from "../components/FiltersBar";
import CVTable from "../components/CVTable";
import { createManualCv, listCvs } from "../lib/cvAdminApi";

const emptyManual = {
  fullName: "",
  email: "",
  phone: "",
  designation: "",
  category: "General",
  status: "new"
};

export default function Dashboard() {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    designation: "",
    status: "",
    minScore: "",
    maxScore: "",
    fromDate: "",
    toDate: "",
    sort: "newest",
    page: 1
  });
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState(emptyManual);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await listCvs({
        ...filters,
        sort: filters.sort === "score" ? "score" : "newest",
        limit: 20
      });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function handleManual(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await createManualCv(manual);
      setShowManual(false);
      setManual(emptyManual);
      setFilters((prev) => ({ ...prev, page: 1 }));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">CV Dashboard</h2>
          <p className="text-sm text-violet-200/70">{data.total} records · newest first by default</p>
        </div>
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500"
        >
          Add Manually
        </button>
      </div>

      <FiltersBar
        value={filters}
        onChange={(next) => setFilters({ ...next, page: 1 })}
        onClear={() =>
          setFilters({
            search: "",
            category: "",
            designation: "",
            status: "",
            minScore: "",
            maxScore: "",
            fromDate: "",
            toDate: "",
            sort: "newest",
            page: 1
          })
        }
      />

      {error ? <p className="rounded-lg bg-red-950/50 px-4 py-3 text-sm text-red-200">{error}</p> : null}
      {loading ? <p className="text-violet-200/70">Loading CVs…</p> : <CVTable items={data.items} />}

      <div className="flex items-center justify-between gap-3 text-sm text-violet-200/80">
        <button
          type="button"
          disabled={filters.page <= 1}
          onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
          className="rounded border border-violet-800 px-3 py-1.5 disabled:opacity-40"
        >
          Previous
        </button>
        <span>
          Page {data.page} of {data.pages}
        </span>
        <button
          type="button"
          disabled={filters.page >= data.pages}
          onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
          className="rounded border border-violet-800 px-3 py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {showManual ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={handleManual} className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-violet-800 bg-[#12081f] p-6">
            <h3 className="text-xl font-bold text-white">Add candidate manually</h3>
            {["fullName", "email", "phone", "designation", "category"].map((field) => (
              <label key={field} className="mt-3 block text-sm capitalize text-violet-100">
                {field.replace(/([A-Z])/g, " $1")}
                <input
                  className="mt-1 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2 text-white"
                  value={manual[field]}
                  onChange={(e) => setManual({ ...manual, [field]: e.target.value })}
                  required={field === "fullName"}
                />
              </label>
            ))}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowManual(false)} className="rounded-lg px-4 py-2 text-sm text-violet-200">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
