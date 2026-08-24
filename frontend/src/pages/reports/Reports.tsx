import { useEffect, useState } from "react";

import { api } from "../../lib/api";
import { ReportRow } from "../../types";

const REPORT_TYPES = [
  { key: "by-category", label: "By Category" },
  { key: "by-department", label: "By Department" },
  { key: "by-status", label: "By Status" },
  { key: "depreciation-summary", label: "Depreciation Summary (Admin only)" },
] as const;

export default function Reports() {
  const [activeReport, setActiveReport] = useState<(typeof REPORT_TYPES)[number]["key"]>("by-category");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get<ReportRow[]>(`/reports/${activeReport}`)
      .then((res) => setRows(res.data))
      .catch(() => setError("You may not have access to this report."))
      .finally(() => setLoading(false));
  }, [activeReport]);

  async function handleExportCsv() {
    const response = await api.get("/reports/export", { params: { type: "csv" }, responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "assets_report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Reports</h1>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Asset breakdowns and exports.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 rounded border border-outline-variant bg-surface-container px-4 py-2 font-data-label text-data-label uppercase text-on-surface transition-colors hover:bg-surface-container-highest"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export CSV
        </button>
      </div>

      <div className="flex gap-2">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.key}
            onClick={() => setActiveReport(r.key)}
            className={`rounded border px-3 py-1.5 font-data-label text-data-label uppercase transition-colors ${
              activeReport === r.key
                ? "border-primary bg-primary-container text-on-primary-container"
                : "border-outline-variant text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded border border-outline-variant bg-surface-bright">
        {loading && <p className="p-4 text-on-surface-variant">Loading...</p>}
        {error && <p className="p-4 text-error">{error}</p>}
        {!loading && !error && (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="tear-line bg-surface font-data-label text-data-label uppercase text-on-surface-variant">
                {columns.map((col) => (
                  <th key={col} className="p-3 font-normal">
                    {col.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {rows.map((row, i) => (
                <tr key={i} className="tear-line hover:bg-surface-container-low">
                  {columns.map((col) => (
                    <td key={col} className="p-3 text-on-surface">
                      {row[col] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} className="p-6 text-center text-on-surface-variant">
                    No data for this report.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
