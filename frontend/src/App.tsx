import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PrinterSettings from "./pages/admin/PrinterSettings";
import UserManagement from "./pages/admin/UserManagement";
import AssetDetail from "./pages/assets/AssetDetail";
import AssetList from "./pages/assets/AssetList";
import Assignments from "./pages/assignments/Assignments";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Maintenance from "./pages/maintenance/Maintenance";
import Reports from "./pages/reports/Reports";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/assets" element={<AssetList />} />
        <Route path="/assets/:id" element={<AssetDetail />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/printers" element={<PrinterSettings />} />
      </Route>
    </Routes>
  );
}
