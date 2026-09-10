import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
    },
    build: {
        outDir: "dist",
    },
    // Relative base so the built index.html works when loaded from a local
    // file:// path inside the PyWebView desktop shell, not just from a server.
    base: "./",
});
