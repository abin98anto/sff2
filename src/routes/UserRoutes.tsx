import { Route, Routes } from "react-router-dom";
import LandingPage from "../pages/user/LandingPage/LandingPage";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />;
    </Routes>
  );
};

export default UserRoutes;
