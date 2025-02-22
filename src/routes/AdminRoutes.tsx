import { Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard/AdminDashboard";
import AdminLayout from "../components/admin/AdminLayout/AdminLayout";
import PageNotFound from "../components/common/PageNotFound/PageNotFound";
import Categories from "../pages/admin/CategoryManagement/CategoryManagement";
import CourseManagement from "../pages/admin/CourseManagement/CourseManagement";
import CourseForm from "../pages/admin/CourseManagement/AddCourse/CourseForm";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route index path="/dashboard" element={<AdminDashboard />} />
        <Route path="/category-management" element={<Categories />} />
        <Route path="/course-management" element={<CourseManagement />} />
        <Route path="/add-course" element={<CourseForm />} />
        <Route path="/edit-course/:id" element={<CourseForm />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default AdminRoutes;
