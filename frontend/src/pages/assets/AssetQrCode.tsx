import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "../../lib/api";
import { Asset } from "../../types";

type LabelType = "A4" | "THERMAL";

export default function AssetQrCode() {
  const { id } = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [labelType, setLabelType] = useState<LabelType>("A4");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.get<Asset>(`/assets/${id}`).then((res) => setAsset(res.data));
    api.get(`/assets/${id}/qr-code`, { responseType: "blob" }).then((res) => {
      setQrUrl(URL.createObjectURL(new Blob([res.data])));
    });
  }, [id]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await api.get(`/assets/${id}/label-pdf`, {
        params: { type: labelType },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${asset?.asset_tag || "asset"}-label.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setDownloading(false);
    }
  }

  async function handlePrint() {
    const res = await api.get(`/assets/${id}/label-pdf`, { params: { type: labelType }, responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const win = window.open(url, "_blank");
    win?.addEventListener("load", () => win.print());
  }

  if (!asset) return <p className="text-on-surface-variant">Loading...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">QR Code</h1>
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
          {asset.name} — <span className="font-asset-id text-asset-id">{asset.asset_tag}</span>
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded border border-outline-variant bg-surface-bright p-8">
        {qrUrl ? (
          <img src={qrUrl} alt={`QR code for ${asset.asset_tag}`} className="h-56 w-56 bg-white p-2" />
        ) : (
          <div className="h-56 w-56 animate-pulse bg-surface-variant" />
        )}
        <p className="font-asset-id text-asset-id text-on-surface">{asset.asset_tag}</p>
      </div>

      <div className="rounded border border-outline-variant bg-surface-bright p-4">
        <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
          Label Template
        </label>
        <div className="mb-4 flex gap-2">
          {(["A4", "THERMAL"] as LabelType[]).map((t) => (
            <button
              key={t}
              onClick={() => setLabelType(t)}
              className={`rounded border px-3 py-1.5 font-data-label text-data-label uppercase transition-colors ${
                labelType === t
                  ? "border-primary bg-primary-container text-on-primary-container"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {t === "A4" ? "A4 Sheet" : "Thermal Label"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded bg-primary-container px-4 py-2 font-data-label text-data-label uppercase text-on-primary-container disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            {downloading ? "Preparing..." : "Download"}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded border border-outline-variant bg-surface-container px-4 py-2 font-data-label text-data-label uppercase text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
