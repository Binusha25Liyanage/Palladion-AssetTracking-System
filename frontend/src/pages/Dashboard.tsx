import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../lib/api";
import { AssetStatus } from "../types";

interface DashboardSummary {
  total_assets: number;
  status_breakdown: Record<AssetStatus, number>;
  upcoming_maintenance_count: number;
  upcoming_maintenance: { asset_tag: string; description: string; due: string }[];
}

const STAT_CARDS: { key: keyof DashboardSummary["status_breakdown"] | "total"; label: string; icon: string }[] = [
  { key: "total", label: "Total Assets", icon: "inventory_2" },
  { key: "ACTIVE", label: "Active", icon: "check_circle" },
  { key: "IN_REPAIR", label: "In-Repair", icon: "build" },
  { key: "RETIRED", label: "Retired", icon: "archive" },
  { key: "DISPOSED", label: "Disposed", icon: "delete" },
];

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    api.get<DashboardSummary>("/dashboard/summary").then((res) => setSummary(res.data));
  }, []);

  if (!summary) return <p className="text-on-surface-variant">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="mb-2 flex items-end justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Dashboard</h1>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Overview of system operations and asset health.
          </p>
        </div>
        <Link
          to="/assets/new"
          className="flex items-center gap-2 rounded bg-primary-container px-4 py-2 font-data-label text-data-label uppercase text-on-primary-container transition-opacity hover:bg-opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Asset
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="asset-card flex flex-col justify-between bg-surface-bright p-3">
            <div className="tear-line mb-2 flex items-start justify-between pb-2">
              <span className="font-data-label text-data-label uppercase text-on-surface-variant">
                {card.label}
              </span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{card.icon}</span>
            </div>
            <div className="font-headline-md text-headline-md text-on-surface">
              {card.key === "total" ? summary.total_assets : summary.status_breakdown[card.key] ?? 0}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Status breakdown (static illustrative chart — swap for real trend data later) */}
        <div className="rounded border border-outline-variant bg-surface-bright p-4 lg:col-span-2">
          <div className="tear-line mb-4 flex items-center justify-between pb-3">
            <h2 className="font-body-lg text-body-lg font-semibold text-on-surface">Status Breakdown Trend</h2>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 font-data-label text-data-label">
                <span className="h-2 w-2 rounded-full bg-primary-container" /> Active
              </span>
              <span className="flex items-center gap-1 font-data-label text-data-label">
                <span className="h-2 w-2 rounded-full bg-outline-variant" /> In-Repair
              </span>
            </div>
          </div>
          <div className="flex min-h-[220px] flex-1 items-end gap-2 pt-4">
            {["Jan", "Feb", "Mar", "Apr", "May"].map((month, i) => (
              <div key={month} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="chart-bar-secondary w-full rounded-t-sm transition-opacity group-hover:opacity-80"
                  style={{ height: `${[20, 25, 15, 30, 20][i]}%` }}
                />
                <div
                  className="chart-bar-primary w-full rounded-t-sm transition-opacity group-hover:opacity-80"
                  style={{ height: `${[60, 65, 70, 50, 75][i]}%` }}
                />
                <span className="mt-2 font-data-label text-data-label text-on-surface-variant">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming maintenance */}
        <div className="flex flex-col rounded border border-outline-variant bg-surface-bright p-4">
          <div className="tear-line mb-4 flex items-center justify-between pb-3">
            <h2 className="font-body-lg text-body-lg font-semibold text-on-surface">Upcoming Maintenance</h2>
            <a href="#" className="font-data-label text-data-label text-primary hover:underline">
              View All
            </a>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {summary.upcoming_maintenance.length === 0 && (
              <p className="text-sm text-on-surface-variant">Nothing due soon.</p>
            )}
            {summary.upcoming_maintenance.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-outline-variant bg-surface p-3"
              >
                <div>
                  <div className="font-asset-id text-asset-id text-on-surface">{item.asset_tag}</div>
                  <div className="mt-1 font-data-label text-data-label text-on-surface-variant">
                    {item.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-data-label text-data-label text-on-surface-variant">{item.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
