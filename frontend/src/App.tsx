import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AssetDetail from "./pages/assets/AssetDetail";
import AssetList from "./pages/assets/AssetList";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";

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
      </Route>
    </Routes>
  );
}
