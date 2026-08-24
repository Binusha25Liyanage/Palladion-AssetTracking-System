import { AssetStatus } from "../types";

// Exact chip colors from the Stitch AI UI export (asset_list_palladion).
// RETIRED / DISPOSED aren't in the Stitch mockups (which use an
// Active / Maintenance / Offline vocabulary) so they're mapped onto the
// same visual language: RETIRED as a neutral/outline chip, DISPOSED as the
// MD3 error chip (same treatment as "Offline (Fault)" in the export).
const STYLES: Record<AssetStatus, string> = {
  ACTIVE: "bg-[#0f5223]/20 text-[#4ade80]",
  IN_REPAIR: "bg-[#7c2d12]/20 text-[#fb923c]",
  RETIRED: "bg-surface-variant text-on-surface-variant",
  DISPOSED: "bg-error-container/40 text-error",
};

const DOT_STYLES: Record<AssetStatus, string> = {
  ACTIVE: "bg-[#4ade80]",
  IN_REPAIR: "bg-[#fb923c]",
  RETIRED: "bg-on-surface-variant",
  DISPOSED: "bg-error animate-pulse",
};

const LABELS: Record<AssetStatus, string> = {
  ACTIVE: "Active",
  IN_REPAIR: "Maintenance",
  RETIRED: "Retired",
  DISPOSED: "Disposed",
};

export default function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} />
      {LABELS[status]}
    </span>
  );
}
