import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// HashRouter (not BrowserRouter): the production build is also loaded from a
// local file:// path inside the PyWebView desktop shell, where there's no
// server to resolve BrowserRouter's history-API routes.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
