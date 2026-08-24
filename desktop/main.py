"""
Lakmee AssetTrack — desktop shell.

This is a thin PyWebView window around the already-built React frontend.
It does not reimplement any business logic: the frontend still talks to the
Django REST API over HTTP exactly as it does in a browser (see
frontend/src/lib/api.ts and its VITE_API_BASE_URL setting).

Usage:
    1. Build the frontend once:  cd ../frontend && npm run build
    2. Run this file:            python main.py

During development, you can instead point ENTRY_URL at the Vite dev server
(http://localhost:5173) to get hot reload while you work on the UI — see the
DEV_MODE flag below.
"""
import os
import sys

import webview

DEV_MODE = os.getenv("ASSETTRACK_DEV") == "1"

# Path to the built frontend (frontend/dist/index.html) relative to this file.
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist", "index.html")

DEV_SERVER_URL = "http://localhost:5173"


def resolve_entry_url() -> str:
    if DEV_MODE:
        return DEV_SERVER_URL

    if not os.path.exists(FRONTEND_DIST):
        sys.exit(
            "Could not find the built frontend at:\n"
            f"  {os.path.abspath(FRONTEND_DIST)}\n\n"
            "Build it first:\n"
            "  cd ../frontend\n"
            "  npm install\n"
            "  npm run build\n\n"
            "Or run with ASSETTRACK_DEV=1 to load the Vite dev server instead "
            "(requires `npm run dev` running separately)."
        )
    return FRONTEND_DIST


class Api:
    """
    Python <-> JS bridge. Empty for now — add methods here only when the
    frontend needs something a browser genuinely can't do (direct printer
    access, local file export, etc). Call from JS via:
        window.pywebview.api.some_method(...)
    """

    def ping(self):
        return "pong"


def main():
    entry_url = resolve_entry_url()
    api = Api()

    webview.create_window(
        title="Lakmee AssetTrack",
        url=entry_url,
        js_api=api,
        width=1360,
        height=860,
        min_size=(1024, 700),
    )
    webview.start()


if __name__ == "__main__":
    main()
