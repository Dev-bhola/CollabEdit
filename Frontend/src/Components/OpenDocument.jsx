import { useState, useEffect } from "react";
import { Link2, X, ExternalLink } from "lucide-react";

const OpenDocument = ({ isOpen, onClose, darkMode, onOpen }) => {
  const [url, setUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setUrl(""); // Reset form when modal is closed
      setIsValidUrl(true);
    }
  }, [isOpen]);

  const validateUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setUrl(value);

    if (value.trim() !== "") {
      setIsValidUrl(validateUrl(value));
    } else {
      setIsValidUrl(true);
    }
  };

  const handleOpenDocument = () => {
    if (url.trim() === "" || !validateUrl(url)) {
      setIsValidUrl(false);
      return;
    }

    window.open(url, "_blank");
    onClose(); // Close modal from parent
    setUrl("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isValidUrl && url.trim() !== "") {
      handleOpenDocument();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`rounded-xl shadow-xl max-w-md w-full bg-white ${
          darkMode ? "dark:bg-gray-800 text-white" : "text-gray-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Link2 size={20} className="text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold">Open Document by URL</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <label
              htmlFor="document-url"
              className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300"
            >
              Document URL
            </label>
            <input
              id="document-url"
              type="text"
              placeholder="https://example.com/document"
              value={url}
              onChange={handleUrlChange}
              onKeyDown={handleKeyDown}
              className={`w-full p-3 rounded-lg border ${
                !isValidUrl
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
              autoFocus
            />
            {!isValidUrl && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Please enter a valid URL (e.g., https://example.com)
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Enter the complete URL of the document you want to open
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleOpenDocument}
              disabled={!isValidUrl || url.trim() === ""}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white transition-colors duration-200 ${
                isValidUrl && url.trim() !== ""
                  ? "hover:bg-blue-700"
                  : "opacity-60 cursor-not-allowed"
              }`}
            >
              <ExternalLink size={18} />
              Open
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenDocument;
