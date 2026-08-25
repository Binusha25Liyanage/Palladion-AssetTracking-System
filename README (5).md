# Palladion

Internal industrial asset-tracking and management system for Lakmee Exports Lanka (Pvt) Ltd.
(Working repo folder name is still `lakmee-assettrack` — the product itself is branded
**Palladion** throughout the UI and docs.)

This repo has three parts:

```
lakmee-assettrack/
├── backend/     Django + Django REST Framework API
├── frontend/    React + Vite + Tailwind (used both in-browser and inside the desktop shell)
└── desktop/     PyWebView desktop shell that wraps the built frontend
```

---

## One-time setup — Backend

Commands below are for **Windows** (Command Prompt). If you're on macOS/Linux, swap
`.venv\Scripts\activate` for `source .venv/bin/activate`, and `copy` for `cp`.

```
cd backend
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Then open `.env` in a text editor and:
- Set `SECRET_KEY` to any random string you type yourself (it just needs to be non-empty and
  hard to guess — exact value doesn't matter for local dev).
- Leave `DATABASE_URL` **completely empty** (`DATABASE_URL=` with nothing after the `=`, not
  even a trailing space) until you've set up a real Postgres/Neon database. With it empty, the
  project automatically falls back to a local `db.sqlite3` file — no database server needed to
  get started.

> **Watch for trailing whitespace.** If `manage.py migrate` ever fails with an error like
> `could not translate host name "host"` or `No support for ''`, it almost always means there's
> an invisible trailing space after `DATABASE_URL=` in `.env`. Delete the line and retype it
> fresh with your cursor stopping right after the `=`.

Then create the database tables and seed the default login:

```
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
```

Default admin login (created by `seed_data`):
```
Email:    admin@lakmee.lk
Password: Admin@1234
```
Change this immediately in any real deployment.

## One-time setup — Frontend

```
cd frontend
copy .env.example .env
npm install
```
The default `VITE_API_BASE_URL` in `.env` already points at `http://localhost:8000/api/v1`,
matching the backend above — you shouldn't need to change it for local dev.

## One-time setup — Desktop shell (PyWebView)

```
cd desktop
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```
The desktop shell has no `package.json` of its own — it's Python-only. Don't run `npm install`
inside `desktop/`; all the npm/React tooling lives in `frontend/`.

---

## Running the project day-to-day

You'll have **three terminals** open at once, since backend + frontend + desktop all run at
the same time.

**Terminal 1 — Backend (always keep this running)**
```
cd backend
.venv\Scripts\activate
python manage.py runserver
```
Serves the API at `http://127.0.0.1:8000`. Both the browser frontend and the desktop app talk
to this, so it needs to stay up no matter which of the other two you're using.

**Terminal 2 — Frontend, in the browser (for day-to-day UI development)**
```
cd frontend
npm run dev
```
Opens the app at `http://localhost:5173` with hot-reload — fastest way to iterate on the UI.

**Terminal 3 — Desktop app (the actual PyWebView window)**

The desktop shell loads a **built** copy of the frontend, not the live dev server, so rebuild
first any time you've changed frontend code:
```
cd frontend
npm run build
```
Then:
```
cd desktop
.venv\Scripts\activate
python main.py
```
This opens the real native Palladion window. It only needs Terminal 1 running underneath it —
Terminal 2 isn't required for the desktop app to work.

**Typical flow:** keep Terminal 1 running always; use Terminal 2 while actively writing/testing
UI changes in a browser; only do the Terminal 3 build + run when you want to check how
something actually looks and behaves in the real desktop shell.

---

## Status

This scaffold implements: custom User model + JWT auth, Departments, Asset Categories, Assets
(with auto-generated `LKM-XX-0001` tags), Assignments (assign/transfer/return), Maintenance logs
+ schedules, Market valuations, Printers + System settings, and an audit log wired up via
Django signals. Role-based access (Admin / Dept Head / Employee) is enforced in the DRF
permission classes and queryset filtering.

Every DRF router in the backend uses `DefaultRouter(trailing_slash=False)`, so **no API
endpoint ever requires or redirects for a trailing slash** — keep new endpoints consistent
with this if you add more.

The frontend UI (Login, Layout/nav, Dashboard, Asset List, Asset Detail, Maintenance,
Assignments, Reports, User Management, Printer Settings) has been rebuilt to match the
**Palladion** design system generated in Stitch AI — dark theme, Material Design 3 color tokens
(Cherry Alloy Red / Ash / Mercury), IBM Plex Sans / Inter / JetBrains Mono typography, and
Material Symbols Outlined icons. The brand mark is at `frontend/public/logo.png` and
`desktop/icon.png`. Tailwind's config (`frontend/tailwind.config.js`) carries the exact token
values from the Stitch export — if you regenerate more screens in Stitch later, copy their
`code.html` markup directly; the color/font/spacing classes will already resolve correctly
against this config. Maintenance, Assignments, Reports, User Management, and Printer Settings
are functional but not yet Stitch-designed (plain dark-theme styling) — restyle them once you
have Stitch mockups for those screens.

Still to build out: PDF document generation (dispatch note / agreement / return note /
maintenance report), QR code image generation + bulk label PDF, Cloudflare R2 image upload,
PDF report export (CSV export already works), a Profile page, and the Android app.
