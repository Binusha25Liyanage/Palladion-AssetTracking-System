# Palladion

Multi-tenant internal industrial asset-tracking and management system.

Two organizations run on this same codebase, each with fully separate data (own users,
assets, departments, everything):
- **PALLADION** — personal/portfolio instance
- **Lakmee Holdings** — real deployment for Lakmee Holdings (Pvt) Ltd

Repo folder is still named `lakmee-assettrack` for historical reasons — the product itself
is branded **Palladion**, and an organization picker on the login screen switches which
tenant's data and branding you're working in.

```
lakmee-assettrack/
├── backend/     Django + Django REST Framework API (multi-tenant)
├── frontend/    React + Vite + Tailwind (used both in-browser and inside the desktop shell)
└── desktop/     PyWebView desktop shell that wraps the built frontend
```

---

## Prerequisites

- **Python 3.12** — install from [python.org/downloads](https://python.org/downloads), NOT
  the Microsoft Store. On the installer's first screen, check **"Add python.exe to PATH"**.
  If Windows says *"Python was not found; run without arguments to install from the
  Microsoft Store"* even after installing, go to
  **Settings > Apps > Advanced app settings > App execution aliases** and turn OFF the
  `python.exe` / `python3.exe` toggles — those are Store stub shortcuts that take priority
  over a real install.
- **Node.js** (for the frontend) and **npm**.
- All commands below are for **Windows Command Prompt**. `cp` is not a Windows command —
  use `copy` instead. If a command ever prints
  `python was not found`, use `py -3.12` in its place.

---

## One-time setup — Backend

```
cd backend
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Open `.env` and edit two lines:

- `SECRET_KEY=` — set it to any random string you type yourself (exact value doesn't
  matter for local dev, it just can't be blank).
- `DATABASE_URL=` — **leave this completely empty**, nothing after the `=`, not even a
  trailing space. With it empty, the project automatically falls back to a local
  `db.sqlite3` file — no Postgres/Neon setup needed to get started.

> **Two real bugs this exact line has caused before:** leaving the template placeholder
> (`postgresql://USER:PASSWORD@HOST/...`) in place causes
> `could not translate host name "host" to address`. A single leftover trailing space
> after `DATABASE_URL=` causes `No support for ''`. If either error shows up, delete the
> whole line and retype `DATABASE_URL=` fresh, cursor stopping immediately after the `=`.

Then create the database tables and seed both organizations:

```
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
```

`seed_data` creates **both** organizations, each with its own admin login and default
asset categories (IT Equipment, Vehicle, Machinery):

| Organization | Login email | Password |
|---|---|---|
| PALLADION | `admin@palladion.local` | `Admin@1234` |
| Lakmee Holdings | `admin@lakmeeholdings.local` | `Admin@1234` |

Change these immediately in any real deployment. `seed_data` is safe to re-run — it skips
anything that already exists and prints what it created, so if you're ever unsure whether
both orgs got seeded, just run it again and read the output.

## One-time setup — Frontend

```
cd frontend
copy .env.example .env
npm install
```

The default `VITE_API_BASE_URL` in `.env` already points at `http://localhost:8000/api/v1`,
matching the backend above.

## One-time setup — Desktop shell (PyWebView)

The desktop shell has its **own separate virtual environment** from the backend — they are
two different folders, two different `.venv`s. Don't run these commands from the project
root; `cd` into `desktop` first.

```
cd desktop
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

`desktop/` has no `package.json` — it's Python-only. Don't run `npm install` in here; all
npm/React tooling lives in `frontend/`.

---

## Running the project day-to-day

Three terminals, running at the same time.

**Terminal 1 — Backend (always keep this running)**
```
cd backend
.venv\Scripts\activate
python manage.py runserver
```
Serves the API at `http://127.0.0.1:8000`. Both the browser frontend and the desktop app
depend on this.

**Terminal 2 — Frontend, in the browser (for day-to-day UI development)**
```
cd frontend
npm run dev
```
Opens the app at `http://localhost:5173` with hot-reload. On the login screen, pick an
organization from the dropdown first, then log in with that org's credentials from the
table above.

**Terminal 3 — Desktop app (the actual PyWebView window)**

Rebuild the frontend first any time you've changed its code, since the desktop shell loads
a **built** copy, not the live dev server:
```
cd frontend
npm run build
```
Then, **from inside the `desktop` folder specifically** (a common mistake is running
`main.py` from the project root, or via an IDE's "Run" button — both end up using the
wrong Python and fail with `ModuleNotFoundError: No module named 'webview'`, since they
skip activating this folder's own venv):
```
cd desktop
.venv\Scripts\activate
python main.py
```
Your prompt should read `(.venv) ...\desktop>` before you run `main.py` — that's the
confirmation you're using the right Python.

---

## Troubleshooting quick reference

| Symptom | Cause | Fix |
|---|---|---|
| `Python was not found; run without arguments to install from the Microsoft Store` | Windows' Store alias stub, not real Python | Use `py -3.12` instead of `python` for venv creation; disable the alias in Settings if it persists |
| `'cp' is not recognized...` | `cp` isn't a Windows command | Use `copy` instead |
| `could not translate host name "host"` | `.env`'s `DATABASE_URL` still has the placeholder value | Blank it: `DATABASE_URL=` with nothing after |
| `No support for ''` | Trailing whitespace after `DATABASE_URL=` | Delete the line, retype it fresh with no trailing space |
| `Dependency on app with no migrations: accounts` (or any app) | A migration file references another app's migration that doesn't exist on disk — usually from a partial migration reset | Delete `db.sqlite3` AND every app's `migrations/000*.py` files (keep each `__init__.py`), then re-run `makemigrations` → `migrate` → `seed_data` from a clean slate |
| `No active account found with the given credentials` | Either the org picked in the dropdown doesn't match that account's real organization, or that org's admin was never seeded | Re-run `python manage.py seed_data` and read its full output to confirm both orgs' admins exist; double check which org is selected in the dropdown |
| `ModuleNotFoundError: No module named 'webview'` | `main.py` was run with the wrong Python (not `desktop\.venv`) | `cd desktop`, then `.venv\Scripts\activate`, then `python main.py` — never run it from the project root |
| `.venv\Scripts\activate` → "The system cannot find the path specified" | Wrong current folder — there's no `.venv` where you're standing | Check your prompt's path; `cd` into `backend` or `desktop` (whichever you're setting up) first |
| Windows Store popped up when typing `python` | Same Store alias issue as above | Same fix — use `py -3.12`, or disable the alias |

---

## Status

**Backend (Django + DRF):** fully multi-tenant. A new `organizations` app holds the
`Organization` model (name, slug, tag_prefix, primary_color, logo_filename); every business
model — User, Department, AssetCategory, Asset, Assignment, MaintenanceLog,
MaintenanceSchedule, MarketValuation, Printer, SystemSettings, AuditLog — carries an
`organization` foreign key, and every ViewSet/APIView queryset is scoped to
`request.user.organization`. Asset tags are per-org (`PLD-IT-0001` vs `LKM-IT-0001`). Login
requires an `organization` slug and rejects mismatched accounts before checking the
password. Every DRF router uses `DefaultRouter(trailing_slash=False)`, so no API endpoint
ever needs or redirects for a trailing slash.

Also implemented: JWT auth, role-based access (Admin / Dept Head / Employee) enforced via
permission classes and queryset filtering, an audit log wired up through Django signals,
QR code generation (`GET /assets/:id/qr-code`), single and bulk asset label PDFs
(A4 sheet or thermal), and PDF documents for dispatch notes, custody agreements, return
notes, and maintenance reports.

**Frontend (React + Vite + Tailwind):** Login (with the Organization picker, showing each
org's logo/name), Dashboard, Asset List (with bulk QR label generation), Asset Detail
(tabbed), Asset Registration, single-asset QR Code page, Maintenance, Assignments (with
document downloads), Reports, User Management, and Printer Settings are all built and
wired to the live API. The UI is styled to match the **Palladion** design system generated
in Stitch AI — dark theme, Material Design 3 color tokens (Cherry Alloy Red / Ash /
Mercury), IBM Plex Sans / Inter / JetBrains Mono typography, Material Symbols Outlined
icons. Brand marks live at `frontend/public/logo-palladion.png` and
`frontend/public/logo-lakmee.png` (plus `desktop/icon.png`).

**Still to build:** a matching light/corporate theme for the Lakmee Holdings organization
(colors sampled from their ID card: red `#D52126`, gray `#A6A6A6`, black text, gold accent
`#E5BB35` from their logo) — the CSS-variable theme-switching system this needs hasn't
been built yet, since colors are currently hardcoded per the Palladion Stitch export. Also
still pending: a proper Settings screen (Profile, Organization & Branding, System
Preferences, Notifications), Cloudflare R2 image upload, PDF report export (CSV export
already works), and the Android app.
