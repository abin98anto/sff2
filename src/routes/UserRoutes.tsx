import { Route, Routes } from "react-router-dom";
import LandingPage from "../pages/user/LandingPage/LandingPage";
import UserLayout from "../components/user/UserLayout/UserLayout";
import PageNotFound from "../components/common/PageNotFound/PageNotFound";
import SubscriptionPage from "../pages/user/SubscriptionsPage/SubscriptionsPage";

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/subscriptions" element={<SubscriptionPage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default UserRoutes;
