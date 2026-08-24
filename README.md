# Lakmee AssetTrack

Internal asset registering & management system for Lakmee Exports Lanka (Pvt) Ltd.

This repo is a starter scaffold with three parts:

```
lakmee-assettrack/
├── backend/     Django + Django REST Framework API
├── frontend/    React + Vite + Tailwind (used both in-browser and inside the desktop shell)
└── desktop/     PyWebView desktop shell that wraps the built frontend
```

## Quick start — Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # fill in DATABASE_URL, SECRET_KEY etc.
python manage.py migrate
python manage.py seed_data        # creates default admin + categories
python manage.py runserver
```

Default admin login (created by `seed_data`):
```
Email:    admin@lakmee.lk
Password: Admin@1234
```
Change this immediately in any real deployment.

## Quick start — Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Quick start — Desktop shell (PyWebView)

Build the frontend first (`npm run build` inside `frontend/`), then:

```bash
cd desktop
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

By default `desktop/main.py` points at the built `frontend/dist` folder. During development
you can instead point it at `http://localhost:5173` (see comments in `main.py`) to load the
live Vite dev server with hot reload.

## Status

This scaffold implements: custom User model + JWT auth, Departments, Asset Categories, Assets
(with auto-generated `LKM-XX-0001` tags), Assignments (assign/transfer/return), Maintenance logs
+ schedules, Market valuations, Printers + System settings, and an audit log wired up via
Django signals. Role-based access (Admin / Dept Head / Employee) is enforced in the DRF
permission classes and queryset filtering.

The frontend UI (Login, Layout/nav, Dashboard, Asset List, Asset Detail) has been rebuilt to
match the **Palladion** design system generated in Stitch AI — dark theme, Material Design 3
color tokens (Cherry Alloy Red / Ash / Mercury), IBM Plex Sans / Inter / JetBrains Mono
typography, and Material Symbols Outlined icons. The brand mark is at
`frontend/public/logo.png` and `desktop/icon.png`. Tailwind's config
(`frontend/tailwind.config.js`) now carries the exact token values from the Stitch export —
if you regenerate more screens in Stitch later, copy their `code.html` markup directly; the
color/font/spacing classes will already resolve correctly against this config.

Still to build out: PDF document generation (dispatch note / agreement / return note /
maintenance report), QR code image generation + bulk label PDF, Cloudflare R2 image upload,
CSV/PDF report export, and the remaining frontend pages (Maintenance, Assignments, Reports,
User Management, Printer Settings, Profile, and the Android app) — the backend endpoints for
these already exist; only their matching Stitch-styled screens still need to be built.
