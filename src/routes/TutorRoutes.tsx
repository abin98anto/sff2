import { Route, Routes } from "react-router-dom";
import TutorLayout from "../components/tutor/TutorLayout/TutorLayout";
import Dashboard from "../pages/tutor/Dashboard/Dashboard";
import PageNotFound from "../components/common/PageNotFound/PageNotFound";
import Profile from "../pages/tutor/Profile/Profile";
import ChatBubble from "../components/common/ChatBubble/ChatBubble";
import VideoCallPage from "../components/common/VideoCallPage/VideoCallPage";
import MyStudents from "../pages/tutor/MyStudents/MyStudents";

const TutorRoutes = () => {
  return (
    <>
      <Routes>
        <Route element={<TutorLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="my-students" element={<MyStudents />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
        <Route path="/video-call" element={<VideoCallPage />} />
      </Routes>
      <ChatBubble />
    </>
  );
};

export default TutorRoutes;
