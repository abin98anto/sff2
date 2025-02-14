import { Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard/AdminDashboard";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<AdminLogin />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AdminRoutes;
