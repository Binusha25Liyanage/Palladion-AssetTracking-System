import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Paginated, Printer } from "../../types";

export default function PrinterSettings() {
  const { user } = useAuth();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", printer_type: "A4" as "A4" | "THERMAL", connection_info: "" });

  function loadPrinters() {
    api.get<Paginated<Printer>>("/printers").then((res) => setPrinters(res.data.results));
  }

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    loadPrinters();
  }, [user]);

  if (user?.role !== "ADMIN") {
    return (
      <div className="rounded border border-outline-variant bg-surface-bright p-6 text-on-surface-variant">
        You don't have access to Printer Settings. This section is Admin-only.
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/printers", form);
      setForm({ name: "", printer_type: "A4", connection_info: "" });
      setShowForm(false);
      loadPrinters();
    } catch {
      setError("Couldn't add printer — check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function setDefault(printer: Printer) {
    await api.patch(`/printers/${printer.id}`, { is_default: true });
    loadPrinters();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Printer Settings</h1>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Configure printers used for QR labels and reports.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded bg-primary-container px-4 py-2 font-data-label text-data-label uppercase text-on-primary-container transition-opacity hover:bg-opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Printer
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded border border-outline-variant bg-surface-bright p-4">
          {error && <p className="mb-3 text-sm text-error">{error}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
                Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
                Type
              </label>
              <select
                value={form.printer_type}
                onChange={(e) => setForm({ ...form, printer_type: e.target.value as "A4" | "THERMAL" })}
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              >
                <option value="A4">A4</option>
                <option value="THERMAL">Thermal</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
                Connection Info
              </label>
              <input
                value={form.connection_info}
                onChange={(e) => setForm({ ...form, connection_info: e.target.value })}
                placeholder="OS printer name or IP"
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded bg-primary-container px-4 py-2 font-data-label text-data-label uppercase text-on-primary-container disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add Printer"}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded border border-outline-variant bg-surface-bright">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="tear-line bg-surface font-data-label text-data-label uppercase text-on-surface-variant">
              <th className="p-3 font-normal">Name</th>
              <th className="p-3 font-normal">Type</th>
              <th className="p-3 font-normal">Connection Info</th>
              <th className="p-3 font-normal">Default</th>
              <th className="p-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm">
            {printers.map((p) => (
              <tr key={p.id} className="tear-line hover:bg-surface-container-low">
                <td className="p-3 text-on-surface">{p.name}</td>
                <td className="p-3 font-data-label text-data-label text-on-surface-variant">{p.printer_type}</td>
                <td className="p-3 text-on-surface-variant">{p.connection_info || "—"}</td>
                <td className="p-3">
                  {p.is_default ? (
                    <span className="rounded bg-[#0f5223]/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#4ade80]">
                      Default
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3">
                  {!p.is_default && (
                    <button
                      onClick={() => setDefault(p)}
                      className="font-data-label text-data-label text-primary hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {printers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-on-surface-variant">
                  No printers configured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
