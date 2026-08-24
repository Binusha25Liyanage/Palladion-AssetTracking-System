import { FormEvent, useEffect, useState } from "react";

import { api } from "../../lib/api";
import { Asset, Assignment, Paginated, User } from "../../types";

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [unassignedAssets, setUnassignedAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [userId, setUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function loadAll() {
    api.get<Paginated<Assignment>>("/assignments").then((res) => setAssignments(res.data.results));
    api
      .get<Paginated<Asset>>("/assets", { params: { status: "ACTIVE" } })
      .then((res) => setUnassignedAssets(res.data.results.filter((a) => !a.current_holder)));
  }

  useEffect(() => {
    loadAll();
    api
      .get<Paginated<User>>("/users")
      .then((res) => setUsers(res.data.results))
      .catch(() => setUsers([])); // non-admins can't list users; assignment form just won't offer a picker
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/assignments", { asset: Number(assetId), assigned_to: Number(userId) });
      setAssetId("");
      setUserId("");
      setShowForm(false);
      loadAll();
    } catch {
      setError("Couldn't create the assignment — check the asset and employee are selected.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReturn(assignment: Assignment) {
    await api.patch(`/assignments/${assignment.id}/return_asset`);
    loadAll();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Assignments</h1>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Assign, transfer, and return assets to employees.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded bg-primary-container px-4 py-2 font-data-label text-data-label uppercase text-on-primary-container transition-opacity hover:bg-opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Assignment
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded border border-outline-variant bg-surface-bright p-4">
          {error && <p className="mb-3 text-sm text-error">{error}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
                Unassigned Asset
              </label>
              <select
                required
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              >
                <option value="">Select an asset...</option>
                {unassignedAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.asset_tag} — {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
                Assign To
              </label>
              <select
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              >
                <option value="">Select an employee...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name} {u.last_name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded bg-primary-container px-4 py-2 font-data-label text-data-label uppercase text-on-primary-container disabled:opacity-60"
          >
            {submitting ? "Assigning..." : "Assign"}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded border border-outline-variant bg-surface-bright">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="tear-line bg-surface font-data-label text-data-label text-on-surface-variant">
              <th className="p-3 font-normal">Asset Tag</th>
              <th className="p-3 font-normal">Assigned To</th>
              <th className="p-3 font-normal">Status</th>
              <th className="p-3 font-normal">Assigned At</th>
              <th className="p-3 font-normal">Returned At</th>
              <th className="p-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm">
            {assignments.map((a) => (
              <tr key={a.id} className="tear-line hover:bg-surface-container-low">
                <td className="p-3 font-asset-id text-asset-id text-on-surface">{a.asset_tag}</td>
                <td className="p-3 text-on-surface">{a.assigned_to_name}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      a.status === "ACTIVE" ? "bg-[#0f5223]/20 text-[#4ade80]" : "bg-surface-variant text-on-surface-variant"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="p-3 font-data-label text-data-label text-on-surface-variant">
                  {new Date(a.assigned_at).toLocaleString()}
                </td>
                <td className="p-3 font-data-label text-data-label text-on-surface-variant">
                  {a.returned_at ? new Date(a.returned_at).toLocaleString() : "—"}
                </td>
                <td className="p-3">
                  {a.status === "ACTIVE" && (
                    <button
                      onClick={() => handleReturn(a)}
                      className="font-data-label text-data-label text-primary hover:underline"
                    >
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-on-surface-variant">
                  No assignments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
