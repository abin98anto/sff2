import { Route, Routes } from "react-router-dom";
import UserRoutes from "./routes/UserRoutes";
import TutorRoutes from "./routes/TutorRoutes";
import AdminRoutes from "./routes/AdminRoutes";

function App() {
  return (
    <Routes>
      <Route path="/*" element={<UserRoutes />} />
      <Route path="/tutor/*" element={<TutorRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}

export default App;
