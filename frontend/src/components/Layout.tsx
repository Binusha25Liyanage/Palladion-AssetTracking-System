import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/assets", label: "Asset List", icon: "inventory_2" },
  { to: "/maintenance", label: "Maintenance", icon: "build" },
  { to: "/assignments", label: "Assignments", icon: "assignment_ind" },
  { to: "/reports", label: "Reports", icon: "assessment" },
];

const ADMIN_ONLY_NAV_ITEMS = [
  { to: "/users", label: "User Management", icon: "group" },
  { to: "/printers", label: "Printer Settings", icon: "print" },
];

const MOBILE_NAV_ITEMS = [
  { to: "/scan", label: "Scan", icon: "qr_code_scanner" },
  { to: "/assets", label: "Assets", icon: "inventory_2" },
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/profile", label: "Profile", icon: "person" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navItems = user?.role === "ADMIN" ? [...NAV_ITEMS, ...ADMIN_ONLY_NAV_ITEMS] : NAV_ITEMS;

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface md:flex-row">
      {/* Side nav (hidden on mobile) */}
      <nav className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-outline-variant bg-surface-container pb-4 pt-4 md:flex">
        <div className="mb-8 flex flex-col items-center px-margin">
          <div className="mb-4 h-16 w-16 overflow-hidden rounded-full border border-outline-variant bg-surface-variant">
            <img src="/logo.png" alt="Palladion" className="h-full w-full object-cover" />
          </div>
          <div className="font-headline-md text-headline-md font-black uppercase tracking-wider text-on-surface">
            Palladion
          </div>
          <div className="font-data-label text-data-label text-on-surface-variant">Industrial Tracking</div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 border-l-[3px] px-4 py-3 font-body-sm text-body-sm transition-all active:scale-[0.98] ${
                  isActive
                    ? "border-primary bg-primary-container text-on-primary-container"
                    : "border-transparent text-on-surface-variant hover:bg-surface-container-highest"
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="tear-line mt-auto space-y-1 border-t-0 px-2 pt-4">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 font-body-sm text-body-sm text-on-surface-variant transition-all hover:bg-surface-container-highest active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">help</span>
            Support
          </a>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left font-body-sm text-body-sm text-on-surface-variant transition-all hover:bg-surface-container-highest active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex min-h-screen flex-1 flex-col pb-20 md:ml-64 md:pb-0">
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface px-margin">
          <div className="flex items-center gap-4">
            <div className="font-headline-md text-headline-md font-bold uppercase tracking-wider text-on-surface md:hidden">
              Palladion
            </div>
            {user?.department_name && (
              <div className="hidden items-center gap-2 rounded border border-outline-variant bg-surface-container px-3 py-1.5 md:flex">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">domain</span>
                <span className="font-data-label text-data-label uppercase text-on-surface-variant">
                  Dept: {user.department_name}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-high active:opacity-80">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-high active:opacity-80">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button className="flex items-center gap-2 rounded-full border border-transparent px-3 py-1.5 text-primary transition-colors hover:border-outline-variant hover:bg-surface-container-high active:opacity-80">
              <span className="font-data-label text-data-label">
                {user?.first_name} {user?.last_name}
              </span>
              <div className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant bg-surface-variant" />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-gutter md:p-margin">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav (mobile only) */}
      <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around rounded-t-xl border-t border-outline-variant bg-surface-container-highest px-4 md:hidden">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex w-full flex-col items-center rounded-lg py-2 transition-colors active:bg-surface-variant ${
                isActive ? "font-bold text-primary" : "text-on-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-data-label mt-1 text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
