import { FormEvent, useEffect, useState } from "react";

import { api } from "../../lib/api";
import { Asset, MaintenanceLog, MaintenanceStatus, Paginated } from "../../types";

const STATUS_STYLES: Record<MaintenanceStatus, string> = {
  REPORTED: "bg-error-container/40 text-error",
  IN_PROGRESS: "bg-[#7c2d12]/20 text-[#fb923c]",
  RESOLVED: "bg-[#0f5223]/20 text-[#4ade80]",
};

export default function Maintenance() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function loadLogs() {
    api.get<Paginated<MaintenanceLog>>("/maintenance-logs").then((res) => setLogs(res.data.results));
  }

  useEffect(() => {
    loadLogs();
    api.get<Paginated<Asset>>("/assets").then((res) => setAssets(res.data.results));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/maintenance-logs", { asset: Number(assetId), issue_description: description });
      setDescription("");
      setAssetId("");
      setShowForm(false);
      loadLogs();
    } catch {
      setError("Couldn't submit — check the asset is selected and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(log: MaintenanceLog, status: MaintenanceStatus) {
    await api.patch(`/maintenance-logs/${log.id}`, { status });
    loadLogs();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Maintenance</h1>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Reported issues and repair status across all assets.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded bg-primary-container px-4 py-2 font-data-label text-data-label uppercase text-on-primary-container transition-opacity hover:bg-opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Report Issue
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded border border-outline-variant bg-surface-bright p-4">
          {error && <p className="mb-3 text-sm text-error">{error}</p>}
          <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
            Asset
          </label>
          <select
            required
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="mb-4 w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
          >
            <option value="">Select an asset...</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.asset_tag} — {a.name}
              </option>
            ))}
          </select>

          <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
            Issue Description
          </label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mb-4 w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
            placeholder="Describe the issue..."
          />

          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-primary-container px-4 py-2 font-data-label text-data-label uppercase text-on-primary-container disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded border border-outline-variant bg-surface-bright">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="tear-line bg-surface font-data-label text-data-label text-on-surface-variant">
              <th className="p-3 font-normal">Asset Tag</th>
              <th className="p-3 font-normal">Issue</th>
              <th className="p-3 font-normal">Status</th>
              <th className="p-3 font-normal">Reported By</th>
              <th className="p-3 font-normal">Reported At</th>
              <th className="p-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm">
            {logs.map((log) => (
              <tr key={log.id} className="tear-line hover:bg-surface-container-low">
                <td className="p-3 font-asset-id text-asset-id text-on-surface">{log.asset_tag}</td>
                <td className="p-3 text-on-surface">{log.issue_description}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLES[log.status]}`}
                  >
                    {log.status.replace("_", " ")}
                  </span>
                </td>
                <td className="p-3 text-on-surface-variant">{log.reported_by_name}</td>
                <td className="p-3 font-data-label text-data-label text-on-surface-variant">
                  {new Date(log.reported_at).toLocaleString()}
                </td>
                <td className="p-3">
                  {log.status !== "RESOLVED" && (
                    <div className="flex gap-2">
                      {log.status === "REPORTED" && (
                        <button
                          onClick={() => updateStatus(log, "IN_PROGRESS")}
                          className="font-data-label text-data-label text-primary hover:underline"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(log, "RESOLVED")}
                        className="font-data-label text-data-label text-primary hover:underline"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-on-surface-variant">
                  No maintenance logs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
