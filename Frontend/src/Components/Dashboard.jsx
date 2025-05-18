import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import OpenDocument from "./OpenDocument";
import ShareDocument from "./ShareDocument";
const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [documents, setDocuments] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [userId,setUserId] = useState("");
  const [newDocumentName, setNewDocumentName] = useState("");
  const navigate = useNavigate();

  const handleShare = async (docId, email, role) => {
    const token = localStorage.getItem("userToken");
    try {
      await axios.post(
        "http://localhost:3000/documents/share",
        {
          documentId: docId,
          email,
          role,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error sharing document:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/");
  };

  const openSpecificDoc = (id) => {
    const doc = documents.filter((d) => d._id === id);
    navigate(`/editor/${doc[0].title}`);
  };

  const delSpecificDoc = (id) => {
    axios.post("http://localhost:3000/documents/delete", { data: id });
    setDocuments(documents.filter((d) => d._id !== id));
  };

  const fetchUserData = () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:3000/documents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUserId(response.data._id);
        setUserName(response.data.name);
        setDocuments(response.data.documents);
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
      });
  };

  const handleCreateDocument = () => {
    if (!newDocumentName.trim()) {
      alert("Document name cannot be empty.");
      return;
    }
    const slug = newDocumentName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    navigate(`/editor/${slug}`);
    setShowModal(false);
    setNewDocumentName("");
  };

  useEffect(() => {
    fetchUserData();
  }, []);
  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <header className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">CollabEdit</Link>
        </h1>
        <div className="flex items-center space-x-4">
          <span>Welcome, {userName}!</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Documents</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded"
          >
            New Document
          </button>
        </div>

        {documents.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <li
                key={doc._id}
                className={`p-4 rounded shadow-md ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } hover:shadow-lg`}
              >
                <h3 className="text-lg font-semibold">{doc.title}</h3>
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => openSpecificDoc(doc._id)}
                    className="bg-blue-500 hover:bg-blue-400 text-white px-2 py-1 rounded"
                  >
                    Open
                  </button>
                  {doc.roles.creator==userId && <button
                    onClick={() => {
                      setSelectedDocId(doc._id);
                      setShowShareModal(true);
                    }}
                    className="bg-purple-500 hover:bg-purple-400 text-white px-2 py-1 rounded"
                  >
                    
                    Add Roles
                  </button>}
                  <button
                    onClick={() => delSpecificDoc(doc._id)}
                    className="bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No documents found. Click "New Document" to create one!</p>
        )}
      </main>

      <footer className="bg-blue-600 text-white py-4 text-center fixed bottom-0 left-0 w-full">
        <p>© {new Date().getFullYear()} Your App. All rights reserved.</p>
      </footer>

      <OpenDocument />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div
            className={`p-6 rounded shadow-lg ${
              darkMode ? "bg-gray-800 text-white" : "text-black bg-white"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">New Document</h2>
            <input
              type="text"
              placeholder="Enter document name"
              value={newDocumentName}
              onChange={(e) => setNewDocumentName(e.target.value)}
              className="w-full p-2 border rounded mb-4 text-black"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCreateDocument}
                className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded"
              >
                Create
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

      <ShareDocument
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        documentId={selectedDocId}
        darkMode={darkMode}
        onShare={handleShare}
      />
    </div>
  );
};

export default Dashboard;
