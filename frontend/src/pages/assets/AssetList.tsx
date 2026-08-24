import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import StatusBadge from "../../components/StatusBadge";
import { api } from "../../lib/api";
import { Asset, Paginated } from "../../types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AssetList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = search ? { search } : {};
    api.get<Paginated<Asset>>("/assets", { params }).then((res) => setAssets(res.data.results));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded border border-outline-variant bg-surface-container px-3 py-1.5">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets, tags, or locations..."
            className="w-72 bg-transparent font-body-sm text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant"
          />
        </div>
        <button className="flex items-center gap-2 rounded border border-outline-variant bg-surface-container px-4 py-2 font-data-label text-data-label uppercase text-on-surface transition-colors hover:bg-surface-container-highest">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export
        </button>
      </div>

      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Asset Directory</h1>
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
          Manage and track all registered industrial equipment and infrastructure.
        </p>
      </div>

      <div className="overflow-hidden rounded border border-outline-variant bg-surface-bright">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="tear-line bg-surface font-data-label text-data-label text-on-surface-variant">
              <th className="p-3 font-normal">Asset Tag</th>
              <th className="p-3 font-normal">Name / Identifier</th>
              <th className="p-3 font-normal">Category</th>
              <th className="p-3 font-normal">Status</th>
              <th className="p-3 font-normal">Department</th>
              <th className="p-3 font-normal">Current Holder</th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm">
            {assets.map((asset) => (
              <tr key={asset.id} className="group relative tear-line hover:bg-surface-container-low">
                <td className="relative p-3 align-middle">
                  <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-primary opacity-0 group-hover:opacity-100" />
                  <Link to={`/assets/${asset.id}`} className="font-asset-id text-asset-id text-on-surface">
                    {asset.asset_tag}
                  </Link>
                </td>
                <td className="p-3 font-medium text-on-surface">{asset.name}</td>
                <td className="p-3 text-on-surface-variant">{asset.category_name}</td>
                <td className="p-3">
                  <StatusBadge status={asset.status} />
                </td>
                <td className="p-3 text-on-surface-variant">{asset.department_name || "—"}</td>
                <td className="p-3 text-on-surface-variant">
                  {asset.current_holder_name ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-outline-variant bg-surface-variant text-[10px] font-bold text-on-surface">
                        {initials(asset.current_holder_name)}
                      </div>
                      {asset.current_holder_name}
                    </div>
                  ) : (
                    "Unassigned"
                  )}
                </td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-on-surface-variant">
                  No assets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
