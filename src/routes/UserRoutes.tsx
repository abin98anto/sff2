import { Route, Routes } from "react-router-dom";
import LandingPage from "../pages/user/LandingPage/LandingPage";
import UserLayout from "../components/user/UserLayout/UserLayout";
import PageNotFound from "../components/common/PageNotFound/PageNotFound";
import SubscriptionPage from "../pages/user/SubscriptionsPage/SubscriptionsPage";
import CourseListPage from "../pages/user/CourseListPage/CourseListPage";
import CourseDetailsPage from "../pages/user/CourseDetailsPage/CourseDetailsPage";
import EnrolledPage from "../pages/user/EnrolledPage/EnrolledPage";

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/subscriptions" element={<SubscriptionPage />} />
        <Route path="/courses" element={<CourseListPage />} />
        <Route path="/course/:courseId" element={<CourseDetailsPage />} />
        <Route path="/study/:courseId" element={<EnrolledPage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default UserRoutes;
