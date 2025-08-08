
import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import useAppStore from "../store/useAppStore";
import { toast } from "react-toastify";

const Login = () => {
  const { setAuthenticated, setUser, theme } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);

  // Trigger animation after component mounts
  useEffect(() => {
    setAnimateForm(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : sanitizeInput(value);
    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, "");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        formData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        setAuthenticated(true);
        setUser(response.data.user);
        toast.success("Successfully logged in!");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Login failed");
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row overflow-hidden ${
        theme ? "bg-[#0a0d14] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Left Side - Decorative */}
      <div className="md:w-1/2 relative hidden md:block">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute inset-0 ${
              theme
                ? "bg-gradient-to-br from-[#0f172a] to-[#0a0d14]"
                : "bg-gradient-to-br from-blue-50 to-indigo-100"
            }`}
          ></div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

          {/* Animated Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large circle */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-xl animate-float-slow"></div>

            {/* Medium circle */}
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl animate-float-medium"></div>

            {/* Small circle */}
            <div className="absolute top-2/3 left-1/3 w-32 h-32 rounded-full bg-gradient-to-r from-cyan-600/20 to-teal-600/20 blur-xl animate-float-fast"></div>

            {/* Rotating rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-96 h-96 border border-blue-500/20 rounded-full animate-spin-slow"></div>
              <div className="w-72 h-72 border border-indigo-500/20 rounded-full animate-spin-slower absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="w-48 h-48 border border-purple-500/20 rounded-full animate-spin-slowest absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center items-center p-12 z-10">
            <div className="relative mb-8">
              <div className="absolute -inset-4 rounded-full blur-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 animate-pulse-slow"></div>
              <div
                className={`relative flex items-center justify-center w-20 h-20 rounded-full ${
                  theme ? "bg-[#111827]" : "bg-white"
                }`}
              >
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                CollabEdit
              </span>
            </h1>

            <p className="text-xl text-center max-w-md mb-8 opacity-80">
              Create, collaborate, and share documents in real-time with our
              powerful editor.
            </p>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className={theme ? "text-blue-400" : "text-blue-600"}>
                Next-gen document collaboration
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-12 relative">
        {/* Mobile Background */}
        <div className="absolute inset-0 md:hidden">
          <div
            className={`absolute inset-0 ${
              theme ? "bg-[#0a0d14]" : "bg-gray-50"
            }`}
          ></div>
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600/10 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-indigo-600/10 to-transparent"></div>
        </div>

        <div
          className={`w-full max-w-md relative ${
            theme
              ? "bg-[#111827]/90 border border-gray-800/50 backdrop-blur-xl"
              : "bg-white/90 border border-gray-200/50 backdrop-blur-xl shadow-2xl"
          } rounded-2xl overflow-hidden transition-all duration-700 ${
            animateForm
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-blue-600/50 via-indigo-600/50 to-purple-600/50 animate-border-glow"></div>

          {/* Content container */}
          <div
            className={`relative rounded-2xl ${
              theme ? "bg-[#111827]" : "bg-white"
            } p-8 md:p-10`}
          >
            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div
                className={`relative flex p-1 rounded-lg ${
                  theme ? "bg-gray-800/50" : "bg-gray-100"
                }`}
              >
                <button
                  onClick={() => setActiveTab("login")}
                  className={`relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === "login"
                      ? "text-white"
                      : theme
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  Sign In
                </button>

                <Link
                  to="/signup"
                  className={`relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === "signup"
                      ? "text-white"
                      : theme
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  Sign Up
                </Link>

                {/* Active tab indicator */}
                <div
                  className={`absolute top-1 left-1 h-[calc(100%-8px)] transition-all duration-200 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 ${
                    activeTab === "login"
                      ? "w-[calc(50%-4px)]"
                      : "w-[calc(50%-4px)] translate-x-[calc(100%+2px)]"
                  }`}
                ></div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
              <p className={`${theme ? "text-gray-400" : "text-gray-500"}`}>
                Sign in to continue to CollabEdit
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="relative">
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium mb-1.5 ${
                      theme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email Address
                  </label>
                  <div className={`relative group`}>
                    <div
                      className={`absolute -inset-0.5 rounded-lg opacity-75 ${
                        errors.email
                          ? "bg-red-500"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-focus-within:opacity-100"
                      } blur transition duration-200`}
                    ></div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`relative w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                        theme
                          ? "bg-[#0c101d] border-gray-700 text-white focus:border-transparent"
                          : "bg-white border-gray-300 text-gray-900 focus:border-transparent"
                      } ${
                        errors.email ? "border-red-500" : "border"
                      } focus:outline-none`}
                      placeholder="name@company.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="relative">
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium mb-1.5 ${
                      theme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Password
                  </label>
                  <div className={`relative group`}>
                    <div
                      className={`absolute -inset-0.5 rounded-lg opacity-75 ${
                        errors.password
                          ? "bg-red-500"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-focus-within:opacity-100"
                      } blur transition duration-200`}
                    ></div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`relative w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                        theme
                          ? "bg-[#0c101d] border-gray-700 text-white focus:border-transparent"
                          : "bg-white border-gray-300 text-gray-900 focus:border-transparent"
                      } ${
                        errors.password ? "border-red-500" : "border"
                      } focus:outline-none`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        theme
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className={`h-4 w-4 rounded focus:ring-blue-500 ${
                        theme
                          ? "bg-[#0c101d] border-gray-700 text-blue-600"
                          : "bg-white border-gray-300 text-blue-600"
                      }`}
                    />
                    <div
                      className={`absolute inset-0 rounded-sm ${
                        formData.rememberMe
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 opacity-50 blur-sm"
                          : ""
                      }`}
                    ></div>
                  </div>
                  <label
                    htmlFor="rememberMe"
                    className={`ml-2 text-sm ${
                      theme ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className={`text-sm font-medium ${
                    theme
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-500"
                  }`}
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full overflow-hidden group rounded-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
                <div className="relative px-6 py-3 flex items-center justify-center text-white font-medium">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </div>
              </button>

              {/* Social Login */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className={`w-full border-t ${
                      theme ? "border-gray-800" : "border-gray-200"
                    }`}
                  ></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className={`px-2 ${
                      theme
                        ? "bg-[#111827] text-gray-400"
                        : "bg-white text-gray-500"
                    }`}
                  >
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className={`flex justify-center items-center py-2.5 rounded-md transition-all duration-200 ${
                    theme
                      ? "bg-[#0c101d] hover:bg-[#161f32] border border-gray-800"
                      : "bg-white hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.0003 2C6.47731 2 2.00031 6.477 2.00031 12C2.00031 16.991 5.65731 21.128 10.4383 21.879V14.89H7.89831V12H10.4383V9.797C10.4383 7.291 11.9323 5.907 14.2153 5.907C15.3103 5.907 16.4543 6.102 16.4543 6.102V8.562H15.1923C13.9503 8.562 13.5623 9.333 13.5623 10.124V12H16.3363L15.8933 14.89H13.5623V21.879C18.3433 21.129 22.0003 16.99 22.0003 12C22.0003 6.477 17.5233 2 12.0003 2Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`flex justify-center items-center py-2.5 rounded-md transition-all duration-200 ${
                    theme
                      ? "bg-[#0c101d] hover:bg-[#161f32] border border-gray-800"
                      : "bg-white hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`flex justify-center items-center py-2.5 rounded-md transition-all duration-200 ${
                    theme
                      ? "bg-[#0c101d] hover:bg-[#161f32] border border-gray-800"
                      : "bg-white hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </button>
              </div>

              <div className="text-center mt-6">
                <p className={theme ? "text-gray-400" : "text-gray-600"}>
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className={`font-medium ${
                      theme
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-600 hover:text-blue-500"
                    }`}
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
