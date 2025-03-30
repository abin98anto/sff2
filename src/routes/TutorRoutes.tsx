import { Route, Routes } from "react-router-dom";
import TutorLayout from "../components/tutor/TutorLayout/TutorLayout";
import PageNotFound from "../components/common/PageNotFound/PageNotFound";
import Profile from "../pages/tutor/Profile/Profile";
import VideoCallPage from "../components/common/VideoCallPage/VideoCallPage";
import MyStudents from "../pages/tutor/MyStudents/MyStudents";
import ProtectedRoute from "../components/common/ProtectedRoutes/ProtectedRoutes";
import ChatBubble2 from "../components/common/ChatBubble/ChatBubble2";
import TutorDashboard from "../pages/tutor/Dashboard/TutorDashboard";

const TutorRoutes = () => {
  return (
    <>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<TutorLayout />}>
            <Route index element={<TutorDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="my-students" element={<MyStudents />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
          <Route path="/video-call" element={<VideoCallPage />} />
        </Route>
      </Routes>
      <ChatBubble2 />
    </>
  );
};

export default TutorRoutes;
