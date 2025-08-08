import {React,useState} from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import axios from "axios";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://collabedit-n5qv.onrender.com/forgot-password",
        {
          email,
        },
        {
          withCredentials: true,
        }
      );

      // Check if the response indicates success
      if (response.status === 200) {
        setEmailSent(true);
      } else {
        throw new Error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to send reset instructions"
      );
    } finally {
      setIsLoading(false);
    }
  };


  const handleOpenGmail = () => {
    window.open("https://mail.google.com", "_blank");
  };

  const ResetForm = () => (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600" />

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
        <p className="text-gray-500">
          Enter your email to receive reset instructions
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="name@company.com"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-500 transition-all duration-200 transform hover:scale-105 font-medium shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
              Sending...
            </div>
          ) : (
            "Send Reset Instructions"
          )}
        </button>
      </form>
    </div>
  );

  const SuccessMessage = () => (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600" />

      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-green-100 p-3 rounded-full">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Check your email</h2>
        <p className="text-gray-600">
          We've sent a password reset link to:
          <br />
          <span className="font-medium text-gray-800">{email}</span>
        </p>
        <p className="text-sm text-gray-500">
          If you don't see the email, check your spam folder
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleOpenGmail}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-500 transition-all duration-200 transform hover:scale-105 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
        >
          <Mail className="w-5 h-5 mr-2" />
          Open Gmail
        </button>

        <Link
          to="/login"
          className="w-full bg-gray-50 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Login
        </Link>
      </div>

      <p className="text-center text-sm text-gray-500">
        Didn't receive the email? Check your spam folder or{" "}
        <button
          onClick={() => setEmailSent(false)}
          className="text-blue-600 hover:underline"
        >
          try again
        </button>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      {emailSent ? <SuccessMessage /> : <ResetForm />}
    </div>
  );
}

export default ForgotPass;
