import { Route, Routes } from "react-router-dom";
import TutorLayout from "../components/tutor/TutorLayout/TutorLayout";
import Dashboard from "../pages/tutor/Dashboard/Dashboard";
import PageNotFound from "../components/common/PageNotFound/PageNotFound";
import Profile from "../pages/tutor/Profile/Profile";

const TutorRoutes = () => {
  return (
    <Routes>
      <Route element={<TutorLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default TutorRoutes;
