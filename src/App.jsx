import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import IntroPage from "./pages/IntroPage";
import QuestionsFlow from "./pages/QuestionsFlow";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import DisplayPlanPage from "./pages/DisplayPlanPage";
import StartWorkoutPage from "./pages/StartWorkoutPage";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/register" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/questions" element={<QuestionsFlow />} />
        <Route path="/display-plan" element={<DisplayPlanPage />} />
        <Route path="/start-workout" element={<StartWorkoutPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
