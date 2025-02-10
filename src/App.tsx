import { Route, Routes } from "react-router-dom";
import UserRoutes from "./routes/UserRoutes";
import TutorRoutes from "./routes/TutorRoutes";

function App() {
  return (
    <Routes>
      <Route path="/*" element={<UserRoutes />} />
      <Route path="/tutor/*" element={<TutorRoutes />} />
    </Routes>
  );
}

export default App;
