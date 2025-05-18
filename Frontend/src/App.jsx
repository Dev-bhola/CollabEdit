import { Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<RedirectToNewEditor />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
      </Routes>
      {/* Toast container for react-toastify */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
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
