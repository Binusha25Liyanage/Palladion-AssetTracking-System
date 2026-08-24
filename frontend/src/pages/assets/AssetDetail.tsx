import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import StatusBadge from "../../components/StatusBadge";
import { api } from "../../lib/api";
import { Asset } from "../../types";

const TABS = ["Overview", "Assignment History", "Maintenance Log", "Audit Trail"] as const;
type Tab = (typeof TABS)[number];

export default function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  useEffect(() => {
    api.get<Asset>(`/assets/${id}`).then((res) => setAsset(res.data));
  }, [id]);

  if (!asset) return <p className="text-on-surface-variant">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-data-label text-data-label uppercase text-on-surface-variant">
          Asset List &gt; {asset.category_name}
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{asset.name}</h1>
          <StatusBadge status={asset.status} />
        </div>
        <p className="font-asset-id text-asset-id text-on-surface-variant">{asset.asset_tag}</p>
      </div>

      {/* Value strip */}
      <div className="asset-card grid grid-cols-1 gap-4 bg-surface-bright p-4 sm:grid-cols-3">
        <div>
          <div className="font-data-label text-data-label uppercase text-on-surface-variant">Purchase Value</div>
          <div className="font-headline-md text-headline-md text-on-surface">
            {asset.purchase_value ?? "—"}
          </div>
          {asset.purchase_date && (
            <div className="font-data-label text-data-label text-on-surface-variant">
              Acquired: {asset.purchase_date}
            </div>
          )}
        </div>
        <div>
          <div className="font-data-label text-data-label uppercase text-on-surface-variant">Current Book Value</div>
          <div className="font-headline-md text-headline-md text-primary">{asset.book_value ?? "—"}</div>
        </div>
        <div>
          <div className="font-data-label text-data-label uppercase text-on-surface-variant">Serial Number</div>
          <div className="font-asset-id text-asset-id text-on-surface">{asset.serial_number || "—"}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tear-line flex gap-6 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-1 pb-2 font-body-sm text-body-sm transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary font-semibold text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded border border-outline-variant bg-surface-bright p-4 lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 font-body-lg text-body-lg font-semibold text-on-surface">
              <span className="material-symbols-outlined text-primary">description</span>
              Specifications
            </h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-data-label text-data-label uppercase text-on-surface-variant">Category</dt>
                <dd className="text-on-surface">{asset.category_name}</dd>
              </div>
              <div>
                <dt className="font-data-label text-data-label uppercase text-on-surface-variant">
                  Useful Life
                </dt>
                <dd className="text-on-surface">{asset.useful_life_years ?? "—"} years</dd>
              </div>
            </dl>
            {asset.description && (
              <div className="tear-line mt-4 pt-4 text-sm">
                <dt className="mb-1 font-data-label text-data-label uppercase text-on-surface-variant">
                  Description
                </dt>
                <dd className="text-on-surface">{asset.description}</dd>
              </div>
            )}
          </div>
          <div className="rounded border border-outline-variant bg-surface-bright p-4">
            <h2 className="mb-4 flex items-center gap-2 font-body-lg text-body-lg font-semibold text-on-surface">
              <span className="material-symbols-outlined text-primary">location_on</span>
              Location
            </h2>
            <div className="border border-outline-variant bg-surface p-3">
              <div className="font-data-label text-data-label uppercase text-on-surface-variant">Site</div>
              <div className="font-body-sm text-body-sm font-semibold text-on-surface">
                {asset.location || "Unassigned"}
              </div>
            </div>
            <div className="mt-4 font-data-label text-data-label uppercase text-on-surface-variant">
              Assigned Operator
            </div>
            <div className="mt-1 text-on-surface">{asset.current_holder_name || "Unassigned"}</div>
          </div>
        </div>
      )}

      {activeTab === "Assignment History" && (
        <div className="rounded border border-outline-variant bg-surface-bright p-4 text-on-surface-variant">
          Assignment history for this asset will appear here.
        </div>
      )}
      {activeTab === "Maintenance Log" && (
        <div className="rounded border border-outline-variant bg-surface-bright p-4 text-on-surface-variant">
          Maintenance log entries for this asset will appear here.
        </div>
      )}
      {activeTab === "Audit Trail" && (
        <div className="rounded border border-outline-variant bg-surface-bright p-4 text-on-surface-variant">
          The full change history (audit log) for this asset will appear here.
        </div>
      )}
    </div>
  );
}
