import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OpenDocument() {
  const [showModal, setShowModal] = useState(false);
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleOpenDocument = () => {
    if (url.trim() !== "") {
      // Replace this with your logic for opening the document
      window.open(url, "_blank"); // Opens the provided URL in a new tab
      setShowModal(false); // Close the modal
    } else {
      alert("Please enter a valid URL");
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
      >
        Open Document
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="p-6 rounded shadow-lg bg-white">
            <h2 className="text-xl font-bold mb-4 text-black">Open Document</h2>
            <input
              type="text"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 border rounded mb-4 text-black"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleOpenDocument}
                className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded"
              >
                Open
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
