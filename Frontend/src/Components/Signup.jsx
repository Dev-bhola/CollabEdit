
import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  FileText,
  ArrowRight,
  Sparkles,
  User,
  Mail,
  Lock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAppStore from "../store/useAppStore";

const Signup = () => {
  const navigate = useNavigate();
  const { setAuthenticated, setUser, theme } = useAppStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [activeField, setActiveField] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const validatePassword = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      setPasswordStrength(validatePassword(value));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setFormComplete(true);

    try {
      const response = await axios.post(
        "https://collabedit-n5qv.onrender.com/api/auth/signup",
        formData,
        { withCredentials: true }
      );

      toast.success(response.data.message || "Account created successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setPasswordStrength(0);
      setAuthenticated(true);
      setUser(response.data.user);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setFormComplete(false);
      if (error.response?.status === 409) {
        toast.error("User already exists. Please try with a different email.");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to create account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (field) => {
    setActiveField(field);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const nextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setErrors({ name: "Name is required" });
        return;
      }
      if (!formData.email.trim()) {
        setErrors({ email: "Email is required" });
        return;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setErrors({ email: "Invalid email address" });
        return;
      }
    }

    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const strengthColors = [
    "bg-red-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-600",
  ];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  // Password requirements
  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    {
      label: "At least 1 uppercase letter",
      met: /[A-Z]/.test(formData.password),
    },
    { label: "At least 1 number", met: /[0-9]/.test(formData.password) },
    {
      label: "At least 1 special character",
      met: /[^A-Za-z0-9]/.test(formData.password),
    },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row overflow-hidden ${
        theme ? "bg-[#0a0d14] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Animated gradient orbs */}
          <div className="absolute top-[10%] left-[15%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/10 blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/10 blur-3xl animate-float-medium"></div>
          <div className="absolute top-[40%] right-[20%] w-[15vw] h-[15vw] rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 blur-3xl animate-float-fast"></div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>

          {/* Subtle noise texture */}
          <div className="absolute inset-0 bg-noise opacity-[0.15]"></div>
        </div>
      </div>

      {/* Left Panel - Decorative */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div
          className={`absolute inset-0 ${
            theme ? "bg-[#0c101d]/80" : "bg-white/80"
          } backdrop-blur-sm z-10`}
        ></div>

        {/* 3D-like decorative elements */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="relative w-[80%] aspect-square">
            {/* Floating elements */}
            <div className="absolute top-[10%] left-[20%] w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-600/80 to-pink-600/80 shadow-xl transform rotate-12 animate-float-slow"></div>
            <div className="absolute top-[30%] right-[15%] w-24 h-24 rounded-full bg-gradient-to-br from-blue-600/80 to-indigo-600/80 shadow-xl animate-float-medium"></div>
            <div className="absolute bottom-[20%] left-[30%] w-20 h-20 rounded-lg bg-gradient-to-br from-cyan-500/80 to-blue-500/80 shadow-xl transform -rotate-12 animate-float-fast"></div>

            {/* Center piece */}
            <div className="absolute inset-0 m-auto w-40 h-40 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl flex items-center justify-center transform animate-pulse-slow">
              <div className="relative">
                <div className="absolute -inset-6 rounded-full blur-md bg-white/20 opacity-70"></div>
                <FileText className="h-16 w-16 text-white" />
              </div>
            </div>

            {/* Orbiting particles */}
            <div className="absolute inset-0 m-auto w-64 h-64 animate-spin-slow">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-purple-400/80 shadow-glow-purple"></div>
            </div>
            <div className="absolute inset-0 m-auto w-72 h-72 animate-spin-slower">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-blue-400/80 shadow-glow-blue"></div>
            </div>
            <div className="absolute inset-0 m-auto w-80 h-80 animate-spin-slowest">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-400/80 shadow-glow-cyan"></div>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="absolute bottom-10 left-0 right-0 text-center z-20">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            CollabEdit
          </h1>
          <p className={`text-lg ${theme ? "text-gray-300" : "text-gray-700"}`}>
            Join the collaborative revolution
          </p>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div
          className={`w-full max-w-md ${
            theme
              ? "bg-[#111827]/60 border border-gray-800/50"
              : "bg-white/60 border border-gray-200/50 shadow-2xl"
          } backdrop-blur-md rounded-3xl overflow-hidden transform transition-all duration-700 ${
            animationComplete
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <div className="absolute inset-px rounded-[calc(1.5rem-1px)] z-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 animate-border-glow"></div>
          </div>

          <div className="relative z-10 p-8 md:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute -inset-4 rounded-full blur-md bg-gradient-to-r from-purple-600/40 to-pink-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div
                  className={`relative flex items-center justify-center w-16 h-16 rounded-full ${
                    theme ? "bg-[#0c101d]" : "bg-white"
                  } shadow-xl border ${
                    theme ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <FileText className="h-8 w-8 text-purple-600" />
                  <Sparkles className="absolute h-3 w-3 top-3 right-3 text-pink-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
                Create Account
              </h2>
              <p className={`${theme ? "text-gray-400" : "text-gray-600"}`}>
                Join CollabEdit to start collaborating
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center w-full max-w-xs">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 1
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : theme
                      ? "bg-gray-800 text-gray-400"
                      : "bg-gray-200 text-gray-500"
                  } transition-all duration-300`}
                >
                  {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : "1"}
                </div>
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > 1
                      ? "bg-gradient-to-r from-purple-600 to-pink-600"
                      : theme
                      ? "bg-gray-800"
                      : "bg-gray-200"
                  } transition-all duration-500`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 2
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : theme
                      ? "bg-gray-800 text-gray-400"
                      : "bg-gray-200 text-gray-500"
                  } transition-all duration-300`}
                >
                  {formComplete ? <CheckCircle className="h-5 w-5" /> : "2"}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Personal Info */}
              <div
                className={`transition-all duration-500 ${
                  currentStep === 1 ? "block" : "hidden"
                }`}
              >
                {/* Name Field */}
                <div
                  className={`relative transition-all duration-300 mb-6 ${
                    activeField === "name" ? "transform scale-[1.02]" : ""
                  }`}
                >
                  <div
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      activeField === "name" || formData.name
                        ? "opacity-100"
                        : "opacity-70"
                    }`}
                  >
                    <User
                      className={`h-5 w-5 ${
                        activeField === "name"
                          ? "text-purple-500"
                          : theme
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    />
                  </div>

                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("name")}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl transition-all duration-300 ${
                      theme
                        ? "bg-[#0c101d]/70 border-gray-700 text-white focus:border-purple-500"
                        : "bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500"
                    } ${
                      errors.name ? "border-red-500" : "border"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
                      activeField === "name"
                        ? "shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        : ""
                    }`}
                    placeholder="Your full name"
                  />

                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1.5 ml-1 absolute">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div
                  className={`relative transition-all duration-300 ${
                    activeField === "email" ? "transform scale-[1.02]" : ""
                  }`}
                >
                  <div
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      activeField === "email" || formData.email
                        ? "opacity-100"
                        : "opacity-70"
                    }`}
                  >
                    <Mail
                      className={`h-5 w-5 ${
                        activeField === "email"
                          ? "text-purple-500"
                          : theme
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    />
                  </div>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("email")}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl transition-all duration-300 ${
                      theme
                        ? "bg-[#0c101d]/70 border-gray-700 text-white focus:border-purple-500"
                        : "bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500"
                    } ${
                      errors.email ? "border-red-500" : "border"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
                      activeField === "email"
                        ? "shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        : ""
                    }`}
                    placeholder="Your email address"
                  />

                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1.5 ml-1 absolute">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={nextStep}
                  className="relative w-full overflow-hidden group rounded-xl mt-12"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 bg-pos-0 transition-all duration-500 group-hover:bg-pos-100"></div>
                  <div className="relative px-6 py-4 flex items-center justify-center text-white font-medium text-lg">
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>

                  {/* Button glow effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10">
                    <div className="absolute inset-0 rounded-xl bg-purple-600/50 blur-xl"></div>
                  </div>
                </button>
              </div>

              {/* Step 2: Password */}
              <div
                className={`transition-all duration-500 ${
                  currentStep === 2 ? "block" : "hidden"
                }`}
              >
                {/* Password Field */}
                <div
                  className={`relative transition-all duration-300 mb-6 ${
                    activeField === "password" ? "transform scale-[1.02]" : ""
                  }`}
                >
                  <div
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      activeField === "password" || formData.password
                        ? "opacity-100"
                        : "opacity-70"
                    }`}
                  >
                    <Lock
                      className={`h-5 w-5 ${
                        activeField === "password"
                          ? "text-purple-500"
                          : theme
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    />
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("password")}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-12 py-4 rounded-xl transition-all duration-300 ${
                      theme
                        ? "bg-[#0c101d]/70 border-gray-700 text-white focus:border-purple-500"
                        : "bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500"
                    } ${
                      errors.password ? "border-red-500" : "border"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
                      activeField === "password"
                        ? "shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        : ""
                    }`}
                    placeholder="Create a password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      theme
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="mb-6 space-y-2">
                    <div className="flex space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : theme
                              ? "bg-gray-700"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-sm ${
                        theme ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Password strength:{" "}
                      {strengthLabels[passwordStrength - 1] || "Too weak"}
                    </p>
                  </div>
                )}

                {/* Password Requirements */}
                <div
                  className={`mb-6 p-4 rounded-xl ${
                    theme ? "bg-[#0c101d]/50" : "bg-gray-100/50"
                  } transition-all duration-300`}
                >
                  <p
                    className={`text-sm font-medium mb-2 ${
                      theme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Password must have:
                  </p>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <li key={index} className="flex items-center text-sm">
                        {req.met ? (
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2 text-gray-400" />
                        )}
                        <span
                          className={
                            req.met
                              ? theme
                                ? "text-gray-300"
                                : "text-gray-700"
                              : theme
                              ? "text-gray-500"
                              : "text-gray-500"
                          }
                        >
                          {req.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Confirm Password Field */}
                <div
                  className={`relative transition-all duration-300 ${
                    activeField === "confirmPassword"
                      ? "transform scale-[1.02]"
                      : ""
                  }`}
                >
                  <div
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      activeField === "confirmPassword" ||
                      formData.confirmPassword
                        ? "opacity-100"
                        : "opacity-70"
                    }`}
                  >
                    <Lock
                      className={`h-5 w-5 ${
                        activeField === "confirmPassword"
                          ? "text-purple-500"
                          : theme
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    />
                  </div>

                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("confirmPassword")}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl transition-all duration-300 ${
                      theme
                        ? "bg-[#0c101d]/70 border-gray-700 text-white focus:border-purple-500"
                        : "bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500"
                    } ${
                      errors.confirmPassword ? "border-red-500" : "border"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
                      activeField === "confirmPassword"
                        ? "shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        : ""
                    }`}
                    placeholder="Confirm your password"
                  />

                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1.5 ml-1 absolute">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className={`flex-1 py-4 px-6 rounded-xl transition-all duration-300 font-medium ${
                      theme
                        ? "bg-[#0c101d]/70 border border-gray-700 hover:bg-[#0c101d] text-gray-300"
                        : "bg-white/70 border border-gray-300 hover:bg-white text-gray-700"
                    } hover:shadow-lg transform hover:-translate-y-0.5`}
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading || formComplete}
                    className="relative flex-1 overflow-hidden group rounded-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 bg-pos-0 transition-all duration-500 group-hover:bg-pos-100"></div>
                    <div className="relative px-6 py-4 flex items-center justify-center text-white font-medium">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                          Creating...
                        </div>
                      ) : formComplete ? (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Success!
                        </div>
                      ) : (
                        <div className="flex items-center">
                          Create Account
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      )}
                    </div>

                    {/* Button glow effect */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10">
                      <div className="absolute inset-0 rounded-xl bg-purple-600/50 blur-xl"></div>
                    </div>
                  </button>
                </div>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className={theme ? "text-gray-400" : "text-gray-600"}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className={`font-medium transition-all duration-200 ${
                    theme
                      ? "text-purple-400 hover:text-purple-300"
                      : "text-purple-600 hover:text-purple-500"
                  } hover:underline`}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
