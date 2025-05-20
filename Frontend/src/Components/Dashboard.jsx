  import React, { useState, useEffect } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import axios from "axios";
  import { toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import OpenDocument from "./OpenDocument";
  import ShareDocument from "./ShareDocument";
  import {
    FileText,
    Plus,
    Sun,
    Moon,
    LogOut,
    Edit,
    Share2,
    Trash2,
    User,
    Search,
    MoreHorizontal,
    Clock,
    ChevronDown,
  } from "lucide-react";
  import useAppStore from "../store/useAppStore";
  const Dashboard = () => {
    const user = useAppStore((state) => state.user);
    const theme = useAppStore((state) => state.theme);
    const setTheme = useAppStore((state) => state.setTheme);
    const [documents, setDocuments] = useState([]);
    
    const [showModal, setShowModal] = useState(false);
    const [showOpenDocumentModal, setShowOpenDocumentModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [userId, setUserId] = useState("");
    const [newDocumentName, setNewDocumentName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [sortBy, setSortBy] = useState("recent");
    const navigate = useNavigate();

    useEffect(() => {
      localStorage.setItem("theme", JSON.stringify(theme));
      document.documentElement.classList.toggle("dark", theme);
    }, [theme]);

    const handleShare = async (docId, email, role) => {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/documents/share",
          { documentId: docId, email, role },
          { withCredentials: true }
        );
        toast.success("Document shared successfully!");
        return response.data;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to share document");
        throw error;
      }
    };

    const openSpecificDoc = (id) => {
      const doc = documents.find((d) => d._id === id);
      if (doc) {
        navigate(`/editor/${doc.title}`);
      }
    };

    const handleLogout = async () => {
      try {
        await axios.post(
          "http://localhost:3000/api/auth/logout",
          {},
          { withCredentials: true }
        );
        toast.success("Logged out successfully");
        navigate("/");
      } catch (error) {
        toast.error("Failed to logout");
        console.error("Logout error:", error);
      }
    };

    const delSpecificDoc = async (id, e) => {
      e.stopPropagation();
      try {
        await axios.post(
          "http://localhost:3000/api/documents/delete",
          { data: id },
          { withCredentials: true }
        );
        setDocuments(documents.filter((d) => d._id !== id));
        toast.success("Document deleted successfully");
      } catch (error) {
        toast.error("Failed to delete document");
        console.error("Delete error:", error);
      }
    };

    const fetchUserData = () => {
      setIsLoading(true);
      
      axios
        .get("http://localhost:3000/api/documents", {
          withCredentials: true,
        })
        .then((response) => {
          console.log("User data:", response.data);
          setUserId(response.data._id);
          setDocuments(response.data.documents);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching documents:", error);
          toast.error("Failed to load documents");
          setIsLoading(false);
        });
        
    };

    const handleCreateDocument = () => {
      if (!newDocumentName.trim()) {
        toast.error("Document name cannot be empty");
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

    const formatDate = (date) => {
      if (!date) return "N/A";
      const now = new Date();
      const docDate = new Date(date);
      const diffTime = Math.abs(now - docDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 1) {
        return "Today";
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return docDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    };

    const filteredDocuments = documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedDocuments = [...filteredDocuments].sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
        );
      } else if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    const getInitials = (name) => {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const openShareModal = (docId, e) => {
      e.stopPropagation();
      setSelectedDocId(docId);
      setShowShareModal(true);
    };

    return (
      <div
        className={`min-h-screen transition-colors duration-200 ${
          theme
            ? "dark bg-gray-900 text-gray-100"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center">
              <FileText className="mr-2 text-blue-600 dark:text-blue-400" />
              <Link
                to="/"
                className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                CollabEdit
              </Link>
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(!theme)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-700 dark:text-gray-300"
                aria-label={
                  theme ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                {theme ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 py-1 px-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                    {getInitials(user.name)}
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-gray-700 dark:text-gray-300"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut
                        size={16}
                        className="mr-2 text-gray-600 dark:text-gray-400"
                      />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Documents
            </h2>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:max-w-xs">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                />
              </div>

              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm">
                  <Clock size={16} className="text-gray-600 dark:text-gray-300" />
                  <span>{sortBy === "recent" ? "Recent" : "Name"}</span>
                  <ChevronDown
                    size={16}
                    onClick={() =>
                      setSortBy(sortBy === "recent" ? "name" : "recent")
                    }
                    className="text-gray-600 dark:text-gray-300"
                  />
                </button>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm"
              >
                <Plus size={18} />
                <span>New</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : sortedDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {sortedDocuments.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => openSpecificDoc(doc._id)}
                  className={`rounded-xl p-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-800 shadow-sm ${
                    theme ? "bg-gray-850" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <FileText
                          size={20}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-medium mb-0.5 text-gray-900 dark:text-white">
                          {doc.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(doc.updatedAt || doc.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.roles.creator === userId && (
                        <>
                          <button
                            onClick={(e) => openShareModal(doc._id, e)}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                            aria-label="Share document"
                          >
                            <Share2 size={16} />
                          </button>
                          <button
                            onClick={(e) => delSpecificDoc(doc._id, e)}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                            aria-label="Delete document"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openSpecificDoc(doc._id);
                        }}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        aria-label="Edit document"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <FileText size={48} className="text-gray-400 mb-4" />
              {searchQuery ? (
                <p className="text-center text-gray-700 dark:text-gray-300">
                  No documents match your search criteria
                </p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                    No documents yet
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                    Create your first document to get started
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <Plus size={18} />
                    Create Document
                  </button>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => setShowOpenDocumentModal(true)}
            className="px-4 py-2 my-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Open Document
          </button>
          <OpenDocument
            isOpen={showOpenDocumentModal}
            onClose={() => setShowOpenDocumentModal(false)}
            theme={theme}
            onOpen={openSpecificDoc}/>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-3 px-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} CollabEdit. All rights reserved.</p>
        </footer>

        {/* New Document Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className={`rounded-xl shadow-xl max-w-md w-full ${
                theme ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
                  Create New Document
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  Enter a name for your new document
                </p>

                <input
                  type="text"
                  placeholder="Document name"
                  value={newDocumentName}
                  onChange={(e) => setNewDocumentName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-6"
                  autoFocus
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateDocument}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Document Modal */}
        <ShareDocument
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          documentId={selectedDocId}
          theme={theme}
          onShare={handleShare}
        />
      </div>
    );
  };

  export default Dashboard;
