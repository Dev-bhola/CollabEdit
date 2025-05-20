import { Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Editor from "./Components/Editor";
import useAppStore from "./store/useAppStore";
import Dashboard from "./Components/Dashboard";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect,useState } from "react";
import ForgotPass from "./Components/ForgotPass";
import axios from "axios";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  const { isAuthenticated, setAuthenticated, setUser } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/auth/check",
          {
            withCredentials: true,
          }
        );
        if (response.data?.user) {
          setAuthenticated(true);
          setUser(response.data.user);
        } else {
          setAuthenticated(false);
        }
      } catch (err) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [setAuthenticated, setUser]);

  if (loading) {
    return <div>Loading...</div>; // or spinner
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <RedirectToNewEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPass />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={2000}
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
