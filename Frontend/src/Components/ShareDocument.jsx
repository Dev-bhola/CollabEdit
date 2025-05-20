import React, { useState } from "react";
import { X, Send, User, UserPlus, AlertTriangle } from "lucide-react";

const ShareDocument = ({ isOpen, onClose, documentId, darkMode, onShare }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleShare = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSharing(true);
    try {
      await onShare(documentId, email, role);
      setSuccess(`Document shared with ${email} successfully!`);
      setEmail("");
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to share document");
    } finally {
      setIsSharing(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`rounded-xl shadow-xl max-w-md w-full ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Share Document</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Invite others to collaborate on this document
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 flex items-start gap-2">
              <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 flex items-start gap-2">
              <User size={18} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleShare}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="role"
                className="block text-sm font-medium mb-1.5"
              >
                Permission Level
              </label>
              <div className="relative">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none pr-10"
                >
                  <option value="viewer">Can view</option>
                  <option value="editor">Can edit</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {role === "viewer"
                  ? "Can read the document but cannot make changes."
                  : "Can make changes to the document and add comments."}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSharing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 ${
                  isSharing ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sharing...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium mb-2">Currently shared with</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <User size={16} className="mr-2" />
            <span>Only you have access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDocument;
