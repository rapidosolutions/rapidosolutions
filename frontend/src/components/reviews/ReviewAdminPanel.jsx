import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../common/Button";
import { deleteReview, listAdminReviews, updateReviewFeatured, updateReviewStatus } from "../../utils/blogApi";

const filters = ["all", "pending", "approved", "hidden", "rejected", "featured"];
const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-rapido-navy outline-none transition focus:border-rapido-blue focus:ring-2 focus:ring-blue-100";

function statusClass(status) {
  if (status === "approved") return "bg-emerald-100 text-emerald-800";
  if (status === "hidden") return "bg-slate-200 text-slate-800";
  if (status === "rejected") return "bg-red-100 text-red-800";
  return "bg-amber-100 text-amber-800";
}

function DeleteReviewDialog({ review, confirmation, error, loading, fallbackFocusRef, onConfirmationChange, onCancel, onDelete }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const cancelRef = useRef(onCancel);
  const loadingRef = useRef(loading);
  cancelRef.current = onCancel;
  loadingRef.current = loading;

  useEffect(() => {
    const previousFocus = document.activeElement;
    inputRef.current?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (!loadingRef.current) cancelRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement && document.contains(previousFocus)) previousFocus.focus();
      else fallbackFocusRef.current?.focus();
    };
  }, [fallbackFocusRef]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-rapido-navy/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onCancel(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="delete-review-title" aria-describedby="delete-review-description" className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow-premium md:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-red-700">Permanent deletion</p>
        <h2 id="delete-review-title" className="mt-2 text-2xl font-extrabold text-rapido-navy">Delete {review.name}&apos;s review?</h2>
        <p id="delete-review-description" className="mt-3 leading-7 text-rapido-slate">This permanently removes only this review and cannot be undone.</p>
        <label className="mt-5 grid gap-2 text-sm font-extrabold text-rapido-navy">
          Type the reviewer name to confirm
          <input ref={inputRef} className={inputClass} value={confirmation} onChange={(event) => onConfirmationChange(event.target.value)} autoComplete="off" />
        </label>
        <p className="mt-2 text-sm text-rapido-slate">Enter exactly: <strong>{review.name}</strong></p>
        {error ? <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-sm font-bold text-red-800">{error}</p> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
          <button type="button" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-red-700 px-5 text-sm font-bold text-white transition hover:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" onClick={onDelete} disabled={confirmation !== review.name || loading}>
            {loading ? "Deleting" : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewAdminPanel({ onUnauthorized }) {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const panelHeadingRef = useRef(null);

  const visibleReviews = useMemo(() => reviews.filter((review) => {
    if (filter === "all") return true;
    if (filter === "featured") return review.featured;
    return review.status === filter;
  }), [filter, reviews]);

  useEffect(() => { loadReviews(); }, []);

  async function loadReviews() {
    setLoading(true);
    setError("");
    try {
      const data = await listAdminReviews({ limit: "100" });
      setReviews(data.reviews || []);
    } catch (loadError) {
      if (loadError.status === 401) onUnauthorized?.();
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(review, status) {
    setNotice(""); setError("");
    try {
      const data = await updateReviewStatus(review.id, status);
      setReviews((current) => current.map((item) => item.id === review.id ? data.review : item));
      setNotice(status === "approved" ? "Review approved." : status === "hidden" ? "Review hidden." : status === "rejected" ? "Review rejected." : "Review status updated.");
    } catch (statusError) {
      if (statusError.status === 401) onUnauthorized?.();
      setError(statusError.message);
    }
  }

  async function changeFeatured(review, featured) {
    setNotice(""); setError("");
    try {
      const data = await updateReviewFeatured(review.id, featured);
      setReviews((current) => current.map((item) => item.id === review.id ? data.review : item));
      setNotice(featured ? "Review featured on the Home page." : "Review removed from the Home page.");
    } catch (featuredError) {
      if (featuredError.status === 401) onUnauthorized?.();
      setError(featuredError.message);
    }
  }

  function openDelete(review) {
    setDeleteTarget(review);
    setDeleteConfirmation("");
    setDeleteError("");
  }

  function closeDelete() {
    if (deleteLoading) return;
    setDeleteTarget(null);
    setDeleteConfirmation("");
    setDeleteError("");
  }

  async function permanentlyDelete() {
    if (!deleteTarget || deleteConfirmation !== deleteTarget.name) return;
    setDeleteLoading(true); setDeleteError("");
    try {
      await deleteReview(deleteTarget.id, deleteConfirmation);
      setReviews((current) => current.filter((review) => review.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteConfirmation("");
      setNotice("Review deleted permanently.");
      setError("");
    } catch (removeError) {
      if (removeError.status === 401) onUnauthorized?.();
      setDeleteError(removeError.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Dashboard</p><h2 ref={panelHeadingRef} tabIndex="-1" className="mt-2 text-2xl font-extrabold text-rapido-navy outline-none">Customer Reviews ({reviews.length})</h2></div>
        <Button type="button" size="sm" variant="secondary" onClick={loadReviews} disabled={loading}>Refresh</Button>
      </div>
      <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-rapido-slate">Reviewer email addresses are private. Only approved reviews may be featured on the Home page.</p>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter reviews">
        {filters.map((value) => <Button key={value} type="button" size="sm" variant={filter === value ? "primary" : "secondary"} onClick={() => setFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</Button>)}
      </div>
      {notice ? <p role="status" className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{notice}</p> : null}
      {error ? <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-bold text-red-800">{error}</p> : null}
      <div className="mt-5 grid gap-4">
        {loading ? <p className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-rapido-slate">Loading reviews...</p> : null}
        {!loading && !visibleReviews.length ? <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-rapido-slate">No reviews match this filter.</p> : null}
        {visibleReviews.map((review) => (
          <article key={review.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap gap-2"><span className={`rounded-full px-2 py-1 text-xs font-extrabold capitalize ${statusClass(review.status)}`}>{review.status}</span>{review.featured ? <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-extrabold text-rapido-blue">Featured</span> : null}</div>
                <h3 className="mt-3 text-xl font-extrabold text-rapido-navy">{review.name}</h3>
                <p className="mt-1 break-words text-sm font-semibold text-rapido-slate"><a className="hover:text-rapido-blue" href={`mailto:${review.email}`}>{review.email}</a>{review.role ? ` · ${review.role}` : ""}{review.company ? ` · ${review.company}` : ""}</p>
                <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.1em] text-rapido-blue">{review.service} · {review.rating}/5 stars · {new Date(review.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex max-w-xl flex-wrap gap-2">
                {review.status !== "approved" ? <Button type="button" size="sm" variant="secondary" onClick={() => changeStatus(review, "approved")}>{review.status === "hidden" ? "Restore" : "Approve"}</Button> : null}
                {review.status === "approved" ? <Button type="button" size="sm" variant="secondary" onClick={() => changeStatus(review, "hidden")}>Hide</Button> : null}
                {review.status !== "rejected" ? <Button type="button" size="sm" variant="ghost" onClick={() => changeStatus(review, "rejected")}>Reject</Button> : null}
                {review.status === "approved" ? <Button type="button" size="sm" variant="ghost" onClick={() => changeFeatured(review, !review.featured)}>{review.featured ? "Unfeature" : "Feature"}</Button> : null}
                <button type="button" className="min-h-9 rounded-md border border-red-300 px-3 text-xs font-extrabold text-red-800 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700" onClick={() => openDelete(review)}>Delete Permanently</button>
              </div>
            </div>
            <blockquote className="mt-5 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 leading-7 text-rapido-slate">“{review.review}”</blockquote>
          </article>
        ))}
      </div>
      {deleteTarget ? <DeleteReviewDialog review={deleteTarget} confirmation={deleteConfirmation} error={deleteError} loading={deleteLoading} fallbackFocusRef={panelHeadingRef} onConfirmationChange={setDeleteConfirmation} onCancel={closeDelete} onDelete={permanentlyDelete} /> : null}
    </div>
  );
}
