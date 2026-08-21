import { Link } from "react-router-dom";
import { CV_ADMIN_BASE } from "../lib/cvAdminApi";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function CVTable({ items }) {
  if (!items?.length) {
    return <p className="rounded-xl border border-violet-900/50 bg-[#12081f] p-8 text-center text-violet-200/70">No CVs match these filters.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-violet-900/60 bg-[#12081f]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-violet-900/60 text-violet-300/80">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Designation</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Score</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((cv) => (
            <tr key={cv.id} className="border-b border-violet-950/80 hover:bg-violet-950/40">
              <td className="px-4 py-3">
                <Link to={`${CV_ADMIN_BASE}/cvs/${cv.id}`} className="font-semibold text-white hover:text-violet-300">
                  {cv.fullName || "Unnamed"}
                </Link>
                <div className="text-xs text-violet-300/60">{cv.email}</div>
              </td>
              <td className="px-4 py-3 text-violet-100">{cv.designation || "—"}</td>
              <td className="px-4 py-3 text-violet-100">{cv.category || "—"}</td>
              <td className="px-4 py-3 font-bold text-violet-200">{cv.cvScore ?? "—"}</td>
              <td className="px-4 py-3 text-violet-100">{formatDate(cv.createdAt)}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-violet-900/70 px-2.5 py-1 text-xs font-semibold capitalize text-violet-100">
                  {cv.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
