import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Chatbot from "./pages/ChatApp";
import ChatBotForm from "./pages/ChatBoxForm";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/ChatBotForm" element={<ChatBotForm />} />
      </Routes>
    </Router>
  );
}

export default App;
