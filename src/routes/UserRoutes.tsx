import { Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "../pages/user/LandingPage/LandingPage";
import UserLayout from "../components/user/UserLayout/UserLayout";
import PageNotFound from "../components/common/PageNotFound/PageNotFound";
import SubscriptionPage from "../pages/user/SubscriptionsPage/SubscriptionsPage";
import CourseListPage from "../pages/user/CourseListPage/CourseListPage";
import CourseDetailsPage from "../pages/user/CourseDetailsPage/CourseDetailsPage";
import EnrolledPage from "../pages/user/EnrolledPage/EnrolledPage";
import MyLearningPage from "../pages/user/MyLearningPage/MyLearningPage";
import VideoCallPage from "../components/common/VideoCallPage/VideoCallPage";
import UserProfile from "../pages/user/UserProfile/UserProfile";
import ProtectedRoute from "../components/common/ProtectedRoutes/ProtectedRoutes";
import ChatBubble2 from "../components/common/ChatBubble/ChatBubble2";

const UserRoutes = () => {
  const location = useLocation();
  const isVideoCallPage = location.pathname === "/video-call";
  return (
    <>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/subscriptions" element={<SubscriptionPage />} />
          <Route path="/courses" element={<CourseListPage />} />
          <Route path="/course/:courseId" element={<CourseDetailsPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/study/:courseId" element={<EnrolledPage />} />
            <Route path="/my-learning" element={<MyLearningPage />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/video-call" element={<VideoCallPage />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      {!isVideoCallPage && <ChatBubble2 />}
    </>
  );
};

export default UserRoutes;
