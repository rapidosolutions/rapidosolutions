import { useEffect, useState } from "react";
import { createAdmin, listAdmins, resetAdminPassword, setAdminActive } from "../lib/cvAdminApi";

const empty = { email: "", fullName: "", role: "admin" };

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const data = await listAdmins();
    setAdmins(data.admins || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const result = await createAdmin(form);
      setNotice(`Created ${result.admin.email}. Temporary password: ${result.temporaryPassword}`);
      setForm(empty);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Manage admins</h2>
          <p className="text-sm text-violet-200/70">Super admins can invite, disable, and reset passwords.</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white">
          Add Admin
        </button>
      </div>

      {error ? <p className="text-red-300">{error}</p> : null}
      {notice ? <p className="rounded-lg bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">{notice}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-violet-900/60 bg-[#12081f]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-violet-900/60 text-violet-300/80">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-b border-violet-950/70">
                <td className="px-4 py-3 text-white">{admin.fullName || "—"}</td>
                <td className="px-4 py-3 text-violet-100">{admin.email}</td>
                <td className="px-4 py-3 text-violet-100">{admin.role}</td>
                <td className="px-4 py-3">{admin.isActive ? "Active" : "Disabled"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded border border-violet-700 px-2 py-1 text-xs"
                      onClick={async () => {
                        await setAdminActive(admin.id, !admin.isActive);
                        await load();
                      }}
                    >
                      {admin.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      className="rounded border border-violet-700 px-2 py-1 text-xs"
                      onClick={async () => {
                        const result = await resetAdminPassword(admin.id);
                        setNotice(`New password for ${result.admin.email}: ${result.temporaryPassword}`);
                      }}
                    >
                      Reset password
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={handleCreate} className="w-full max-w-md rounded-2xl border border-violet-800 bg-[#12081f] p-6">
            <h3 className="text-xl font-bold text-white">Add admin</h3>
            <label className="mt-4 block text-sm text-violet-100">
              Full name
              <input className="mt-1 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </label>
            <label className="mt-3 block text-sm text-violet-100">
              Email
              <input type="email" className="mt-1 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label className="mt-3 block text-sm text-violet-100">
              Role
              <select className="mt-1 w-full rounded-lg border border-violet-800 bg-[#0b0618] px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">admin</option>
                <option value="super_admin">super_admin</option>
              </select>
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-violet-200">
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white">
                Create &amp; invite
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
