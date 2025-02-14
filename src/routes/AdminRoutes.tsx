import { Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin/AdminLogin";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<AdminLogin />} />
    </Routes>
  );
};

export default AdminRoutes;
