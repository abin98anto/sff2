import { Route, Routes } from "react-router-dom";
import UserRoutes from "./routes/UserRoutes";
import TutorRoutes from "./routes/TutorRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import Loading from "./components/common/Loading/Loading";
import { useAppSelector } from "./hooks/reduxHooks";

function App() {
  const { loading } = useAppSelector((state) => state.user);
  return (
    <>
      {loading && <Loading />}
      <Routes>
        <Route path="/*" element={<UserRoutes />} />
        <Route path="/tutor/*" element={<TutorRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </>
  );
}

export default App;
