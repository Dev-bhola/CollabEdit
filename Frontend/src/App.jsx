import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Editor from "./Components/Editor";
import Dashboard from "./Components/Dashboard";
import { v4 as uuidv4 } from "uuid";
import React from "react";
import ForgotPass from "./Components/ForgotPass";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/editor" element={<RedirectToNewEditor />} />
      <Route path="/editor/:id" element={<Editor />} />
      <Route path="/forgot-password" element={<ForgotPass />} />
    </Routes>
  );
}
function RedirectToNewEditor() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const newId = uuidv4();
    navigate(`/editor/${newId}`);
  }, [navigate]);

  return null;
}

export default App;
