import { Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard/AdminDashboard";
import AdminLayout from "../components/admin/AdminLayout/AdminLayout";
import PageNotFound from "../components/common/PageNotFound/PageNotFound";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default AdminRoutes;
