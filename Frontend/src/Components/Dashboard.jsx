import { useState, useEffect } from "react";
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
  Grid,
  List,
  Star,
  StarOff,
  Filter,
  SortAsc,
  Calendar,
  Settings,
  HelpCircle,
  Bell,
  Folder,
  FolderPlus,
  Users,
  Sparkles,
  X,
  Loader2,
  ChevronRight,
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen,
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
  const [viewMode, setViewMode] = useState("grid");
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [starredDocs, setStarredDocs] = useState([]);
  // const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  // const [folders, setFolders] = useState([
    
  // ]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const navigate = useNavigate();

  // Mock notifications
  // const notifications = [
  //   {
  //     id: 1,
  //     title: "Document shared",
  //     message: "Alex shared 'Project Proposal' with you",
  //     time: "2 hours ago",
  //     read: false,
  //   },
  //   {
  //     id: 2,
  //     title: "Comment added",
  //     message: "Sarah commented on 'Meeting Notes'",
  //     time: "Yesterday",
  //     read: true,
  //   },
  //   {
  //     id: 3,
  //     title: "Edit suggestion",
  //     message: "Mike suggested edits to 'Quarterly Report'",
  //     time: "3 days ago",
  //     read: true,
  //   },
  // ];

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(theme));
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
    console.log(id);
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
        // Initialize starred docs (in a real app, this would come from the backend)
        setStarredDocs(
          response.data.documents.slice(0, 2).map((doc) => doc._id)
        );
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

  // const handleCreateFolder = () => {
  //   if (!newFolderName.trim()) {
  //     toast.error("Folder name cannot be empty");
  //     return;
  //   }
  //   const newFolder = {
  //     id: `folder-${Date.now()}`,
  //     name: newFolderName,
  //     count: 0,
  //   };
  //   setFolders([...folders, newFolder]);
  //   setShowCreateFolderModal(false);
  //   setNewFolderName("");
  //   toast.success(`Folder "${newFolderName}" created successfully`);
  // };

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

  const toggleStarred = (docId, e) => {
    e.stopPropagation();
    if (starredDocs.includes(docId)) {
      setStarredDocs(starredDocs.filter((id) => id !== docId));
    } else {
      setStarredDocs([...starredDocs, docId]);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "starred")
      return matchesSearch && starredDocs.includes(doc._id);
    if (activeFilter === "recent") {
      const docDate = new Date(doc.updatedAt || doc.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - docDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return matchesSearch && diffDays <= 7;
    }
    if (activeFilter === "folder" && selectedFolder) {
      // In a real app, you'd check if the document belongs to the selected folder
      return matchesSearch;
    }

    return matchesSearch;
  });

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
        theme ? "bg-[#0a0d14] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-xl ${
          theme
            ? "bg-[#111827]/80 border-b border-gray-800/50"
            : "bg-white/80 border-b border-gray-200/50 shadow-sm"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold flex items-center">
              <div className="relative mr-2">
                <div className="absolute -inset-1 rounded-full blur-md bg-gradient-to-r from-blue-600 to-indigo-600 opacity-70"></div>
                <FileText className="h-6 w-6 relative text-blue-600" />
              </div>
              <Link
                to="/"
                className={`${
                  theme
                    ? "text-white hover:text-blue-400"
                    : "text-gray-900 hover:text-blue-600"
                } transition-colors duration-200`}
              >
                CollabEdit
              </Link>
            </h1>

            {/* <div
              className={`hidden md:flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                theme
                  ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20"
                  : "bg-blue-50 border border-blue-100"
              }`}
            >
              <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
              <span Plapan className={theme ? "text-blue-400" : "text-blue-600"}>
                n
              </span>
            </div> */}
            <div
              className="p-2 m-2 md:hidden"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? <PanelLeftClose /> : <PanelLeftOpen />}
            </div>
          </div>

          <div className="relative max-w-xl w-full hidden md:block mx-4">
            <div
              className={`absolute inset-0 -m-1 rounded-lg opacity-0 group-focus-within:opacity-75 transition duration-200 ${
                theme
                  ? "bg-gradient-to-r from-blue-600/50 to-indigo-600/50 blur"
                  : "bg-blue-100 blur"
              }`}
            ></div>
            <div className="relative flex items-center">
              <Search
                size={18}
                className={`absolute left-3 ${
                  theme ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                  theme
                    ? "bg-[#0c101d] border-gray-700 text-white focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            {/* <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full transition-colors duration-200 relative ${
                  theme
                    ? "hover:bg-gray-800 text-gray-300"
                    : "hover:bg-gray-200 text-gray-700"
                }`}
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-blue-600"></span>
              </button>

              {showNotifications && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg py-1 z-20 border overflow-hidden ${
                    theme
                      ? "bg-[#111827] border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-semibold">Notifications</h3>
                    <button
                      className={`text-xs ${
                        theme
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b last:border-0 ${
                          theme ? "border-gray-800" : "border-gray-100"
                        } ${
                          !notification.read
                            ? theme
                              ? "bg-blue-900/10"
                              : "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                theme ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                theme ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                theme ? "text-gray-500" : "text-gray-500"
                              }`}
                            >
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 text-center">
                    <button
                      className={`text-xs ${
                        theme
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div> */}

            <button
              onClick={() => setTheme(!theme)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                theme
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              aria-label={
                theme ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {theme ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 py-1 px-2 rounded-lg transition-colors duration-200 ${
                  theme ? "hover:bg-gray-800" : "hover:bg-gray-200"
                }`}
              >
                <div className="relative">
                  <div
                    className={`absolute -inset-0.5 rounded-full opacity-75 ${
                      theme
                        ? "bg-gradient-to-r from-blue-600/50 to-indigo-600/50"
                        : "bg-blue-100"
                    } blur-sm`}
                  ></div>
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      theme
                        ? "bg-[#0c101d] text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    {getInitials(user.name)}
                  </div>
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown
                  size={16}
                  className={theme ? "text-gray-400" : "text-gray-500"}
                />
              </button>

              {showUserMenu && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-1 z-20 border overflow-hidden ${
                    theme
                      ? "bg-[#111827] border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div
                    className={`px-4 py-3 border-b ${
                      theme ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        theme ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.name}
                    </p>
                    <p
                      className={`text-xs truncate ${
                        theme ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {user.email}
                    </p>
                  </div>

                  {/* <div className="py-1">
                    <button
                      className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                        theme
                          ? "text-gray-300 hover:bg-gray-800"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <User size={16} className="mr-2 opacity-70" />
                      Profile
                    </button>
                    <button
                      className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                        theme
                          ? "text-gray-300 hover:bg-gray-800"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Settings size={16} className="mr-2 opacity-70" />
                      Settings
                    </button>
                    <button
                      className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                        theme
                          ? "text-gray-300 hover:bg-gray-800"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <HelpCircle size={16} className="mr-2 opacity-70" />
                      Help & Support
                    </button>
                  </div> */}

                  <div
                    className={`border-t py-1 ${
                      theme ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    <button
                      onClick={handleLogout}
                      className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                        theme
                          ? "text-red-400 hover:bg-gray-800"
                          : "text-red-600 hover:bg-gray-100"
                      }`}
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-3">
        <div className="relative">
          <Search
            size={18}
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
              theme
                ? "bg-[#0c101d] border-gray-700 text-white focus:border-blue-500"
                : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
          />
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-[61px] h-[calc(100vh-61px)] z-20 transition-all duration-300 ${
            showSidebar ? "left-0" : "-left-64"
          } md:left-0 w-64 ${
            theme
              ? "bg-[#111827] border-r border-gray-800"
              : "bg-white border-r border-gray-200"
          }`}
        >
          <div className="p-4 h-full flex flex-col">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm mb-6 group"
            >
              <Plus
                size={18}
                className="transition-transform group-hover:rotate-90 duration-200"
              />
              <span>New Document</span>
            </button>

            <nav className="space-y-1 mb-6">
              <button
                onClick={() => {
                  setActiveFilter("all");
                  setSelectedFolder(null);
                }}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-sm ${
                  activeFilter === "all"
                    ? theme
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-900"
                    : theme
                    ? "text-gray-300 hover:bg-gray-800/50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FileText size={18} className="mr-2 opacity-70" />
                All Documents
              </button>
              <button
                onClick={() => {
                  setActiveFilter("starred");
                  setSelectedFolder(null);
                }}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-sm ${
                  activeFilter === "starred"
                    ? theme
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-900"
                    : theme
                    ? "text-gray-300 hover:bg-gray-800/50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Star size={18} className="mr-2 opacity-70" />
                Starred
              </button>
              <button
                onClick={() => {
                  setActiveFilter("recent");
                  setSelectedFolder(null);
                }}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-sm ${
                  activeFilter === "recent"
                    ? theme
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-900"
                    : theme
                    ? "text-gray-300 hover:bg-gray-800/50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Clock size={18} className="mr-2 opacity-70" />
                Recent
              </button>
            </nav>

            {/* <div className="mb-3 flex items-center justify-between">
              <h3
                className={`text-xs font-semibold ${
                  theme ? "text-gray-400" : "text-gray-500"
                }`}
              >
                FOLDERS
              </h3>
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className={`p-1 rounded-md ${
                  theme
                    ? "hover:bg-gray-800 text-gray-400"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <FolderPlus size={16} />
              </button>
            </div>

            <div className="space-y-1 overflow-y-auto flex-grow">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveFilter("folder");
                    setSelectedFolder(folder.id);
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm ${
                    activeFilter === "folder" && selectedFolder === folder.id
                      ? theme
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                      : theme
                      ? "text-gray-300 hover:bg-gray-800/50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center">
                    <Folder size={18} className="mr-2 opacity-70" />
                    <span>{folder.name}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      theme
                        ? "bg-gray-800 text-gray-400"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {folder.count}
                  </span>
                </button>
              ))}
            </div> */}

            {/* <div className="mt-auto">
              <div
                className={`p-4 rounded-xl ${
                  theme
                    ? "bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-800/30"
                    : "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles
                    className={`h-4 w-4 ${
                      theme ? "text-blue-400" : "text-blue-500"
                    }`}
                  />
                  <h3
                    className={`text-sm font-medium ${
                      theme ? "text-blue-400" : "text-blue-700"
                    }`}
                  >
                    Pro Features
                  </h3>
                </div>
                <p
                  className={`text-xs mb-3 ${
                    theme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Unlock advanced collaboration tools and more storage
                </p>
                <button
                  className={`text-xs py-1.5 px-3 rounded-lg w-full ${
                    theme
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Upgrade Now
                </button>
              </div>
            </div> */}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 md:p-6 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2
                className={`text-2xl font-bold ${
                  theme ? "text-white" : "text-gray-900"
                }`}
              >
                {activeFilter === "all"
                  ? "All Documents"
                  : activeFilter === "starred"
                  ? "Starred Documents"
                  : activeFilter === "recent"
                  ? "Recent Documents"
                  : activeFilter === "folder" && selectedFolder}
              </h2>
              <p
                className={`text-sm ${
                  theme ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {sortedDocuments.length} document
                {sortedDocuments.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative">
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                    theme
                      ? "bg-[#0c101d] border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    setSortBy(sortBy === "recent" ? "name" : "recent")
                  }
                >
                  <SortAsc size={16} className="opacity-70" />
                  <span>{sortBy === "recent" ? "Recent" : "Name"}</span>
                </button>
              </div>

              <div
                className={`border rounded-lg overflow-hidden flex ${
                  theme ? "border-gray-700" : "border-gray-300"
                }`}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? theme
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                      : theme
                      ? "bg-[#0c101d] text-gray-400 hover:text-gray-300"
                      : "bg-white text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? theme
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                      : theme
                      ? "bg-[#0c101d] text-gray-400 hover:text-gray-300"
                      : "bg-white text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List size={16} />
                </button>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm"
              >
                <Plus size={18} />
                <span className="hidden md:inline">New Document</span>
                <span className="md:hidden">New</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
              <p className={theme ? "text-gray-400" : "text-gray-600"}>
                Loading documents...
              </p>
            </div>
          ) : sortedDocuments.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedDocuments.map((doc) => (
                  <div
                    key={doc._id}
                    onClick={() => openSpecificDoc(doc._id)}
                    className={`rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 border ${
                      theme
                        ? "bg-[#111827]/80 border-gray-800 hover:border-gray-700"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div
                      className={`h-32 relative ${
                        theme ? "bg-[#0c101d]" : "bg-gray-50"
                      }`}
                    >
                      {/* Document preview (placeholder) */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-50">
                        <FileText
                          size={48}
                          className={theme ? "text-gray-700" : "text-gray-300"}
                        />
                      </div>

                      {/* Hover actions */}
                      <div
                        className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-200 ${
                          theme ? "bg-gray-900/70" : "bg-white/70"
                        } backdrop-blur-sm rounded-lg p-1 opacity-0 group-hover:opacity-100`}
                      >
                        <button
                          onClick={(e) => toggleStarred(doc._id, e)}
                          className={`p-1.5 rounded-md ${
                            theme ? "hover:bg-gray-800" : "hover:bg-gray-200"
                          }`}
                          aria-label={
                            starredDocs.includes(doc._id)
                              ? "Remove from starred"
                              : "Add to starred"
                          }
                        >
                          {starredDocs.includes(doc._id) ? (
                            <Star
                              size={16}
                              className="text-yellow-400 fill-yellow-400"
                            />
                          ) : (
                            <StarOff
                              size={16}
                              className={
                                theme ? "text-gray-400" : "text-gray-600"
                              }
                            />
                          )}
                        </button>
                        {doc.roles.creator === userId && (
                          <>
                            <button
                              onClick={(e) => openShareModal(doc._id, e)}
                              className={`p-1.5 rounded-md ${
                                theme
                                  ? "hover:bg-gray-800"
                                  : "hover:bg-gray-200"
                              }`}
                              aria-label="Share document"
                            >
                              <Share2
                                size={16}
                                className={
                                  theme ? "text-gray-300" : "text-gray-600"
                                }
                              />
                            </button>
                            <button
                              onClick={(e) => delSpecificDoc(doc._id, e)}
                              className={`p-1.5 rounded-md ${
                                theme
                                  ? "hover:bg-gray-800"
                                  : "hover:bg-gray-200"
                              }`}
                              aria-label="Delete document"
                            >
                              <Trash2
                                size={16}
                                className={
                                  theme ? "text-gray-300" : "text-gray-600"
                                }
                              />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`text-base font-medium truncate ${
                            theme ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {doc.title}
                        </h3>
                        {starredDocs.includes(doc._id) && (
                          <Star
                            size={14}
                            className="text-yellow-400 fill-yellow-400 flex-shrink-0"
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs ${
                            theme ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {formatDate(doc.updatedAt || doc.createdAt)}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openSpecificDoc(doc._id);
                          }}
                          className={`p-1 rounded-md ${
                            theme
                              ? "hover:bg-gray-800 text-blue-400"
                              : "hover:bg-gray-100 text-blue-600"
                          } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                        >
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedDocuments.map((doc) => (
                  <div
                    key={doc._id}
                    onClick={() => openSpecificDoc(doc._id)}
                    className={`rounded-xl p-4 cursor-pointer group transition-all duration-200 border ${
                      theme
                        ? "bg-[#111827]/80 border-gray-800 hover:border-gray-700"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2.5 rounded-lg ${
                            theme ? "bg-[#0c101d]" : "bg-gray-50"
                          }`}
                        >
                          <FileText
                            size={20}
                            className={
                              theme ? "text-blue-400" : "text-blue-600"
                            }
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-base font-medium truncate ${
                                theme ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {doc.title}
                            </h3>
                            {starredDocs.includes(doc._id) && (
                              <Star
                                size={14}
                                className="text-yellow-400 fill-yellow-400 flex-shrink-0"
                              />
                            )}
                          </div>
                          <p
                            className={`text-xs ${
                              theme ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {formatDate(doc.updatedAt || doc.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => toggleStarred(doc._id, e)}
                          className={`p-2 rounded-full ${
                            theme ? "hover:bg-gray-800" : "hover:bg-gray-200"
                          } ${
                            !starredDocs.includes(doc._id) &&
                            "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          }`}
                          aria-label={
                            starredDocs.includes(doc._id)
                              ? "Remove from starred"
                              : "Add to starred"
                          }
                        >
                          {starredDocs.includes(doc._id) ? (
                            <Star
                              size={16}
                              className="text-yellow-400 fill-yellow-400"
                            />
                          ) : (
                            <StarOff
                              size={16}
                              className={
                                theme ? "text-gray-400" : "text-gray-600"
                              }
                            />
                          )}
                        </button>
                        {doc.roles.creator === userId && (
                          <>
                            <button
                              onClick={(e) => openShareModal(doc._id, e)}
                              className={`p-2 rounded-full ${
                                theme
                                  ? "hover:bg-gray-800"
                                  : "hover:bg-gray-200"
                              } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                              aria-label="Share document"
                            >
                              <Share2
                                size={16}
                                className={
                                  theme ? "text-gray-300" : "text-gray-600"
                                }
                              />
                            </button>
                            <button
                              onClick={(e) => delSpecificDoc(doc._id, e)}
                              className={`p-2 rounded-full ${
                                theme
                                  ? "hover:bg-gray-800"
                                  : "hover:bg-gray-200"
                              } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                              aria-label="Delete document"
                            >
                              <Trash2
                                size={16}
                                className={
                                  theme ? "text-gray-300" : "text-gray-600"
                                }
                              />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openSpecificDoc(doc._id);
                          }}
                          className={`p-2 rounded-full ${
                            theme
                              ? "hover:bg-gray-800 text-blue-400"
                              : "hover:bg-gray-200 text-blue-600"
                          } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div
              className={`flex flex-col items-center justify-center h-64 rounded-xl border border-dashed ${
                theme
                  ? "bg-[#111827]/50 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <div className="relative mb-4">
                <div
                  className={`absolute -inset-4 rounded-full blur-xl ${
                    theme ? "bg-blue-900/20" : "bg-blue-100"
                  }`}
                ></div>
                <FileText
                  size={48}
                  className={`relative ${
                    theme ? "text-gray-600" : "text-gray-400"
                  }`}
                />
              </div>
              {searchQuery ? (
                <p
                  className={`text-center ${
                    theme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No documents match your search criteria
                </p>
              ) : (
                <>
                  <p
                    className={`text-lg font-medium mb-2 ${
                      theme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    No documents yet
                  </p>
                  <p
                    className={`text-center mb-4 ${
                      theme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Create your first document to get started
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 group"
                  >
                    <Plus
                      size={18}
                      className="transition-transform group-hover:rotate-90 duration-200"
                    />
                    Create Document
                  </button>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => setShowOpenDocumentModal(true)}
            className={`px-4 py-2 my-5 rounded-lg transition-colors duration-200 ${
              theme
                ? "bg-[#111827] text-white hover:bg-gray-800 border border-gray-800"
                : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm"
            }`}
          >
            Open Document
          </button>
          <OpenDocument
            isOpen={showOpenDocumentModal}
            onClose={() => setShowOpenDocumentModal(false)}
            theme={theme}
            onOpen={openSpecificDoc}
          />
        </main>
      </div>

      {/* Footer */}
      <footer
        className={`fixed bottom-0 w-full py-3 px-6 text-center text-sm z-10 backdrop-blur-md ${
          theme
            ? "bg-[#111827]/80 border-t border-gray-800 text-gray-400"
            : "bg-white/80 border-t border-gray-200 text-gray-600"
        }`}
      >
        <p>© {new Date().getFullYear()} CollabEdit. All rights reserved.</p>
      </footer>

      {/* New Document Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className={`rounded-xl shadow-xl max-w-md w-full overflow-hidden ${
              theme ? "bg-[#111827] text-white" : "bg-white text-gray-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header with gradient */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>

            <div className="p-6">
              <h2
                className={`text-xl font-bold mb-1 ${
                  theme ? "text-white" : "text-gray-900"
                }`}
              >
                Create New Document
              </h2>
              <p
                className={`text-sm mb-6 ${
                  theme ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Enter a name for your new document
              </p>

              <div className="relative group mb-6">
                <div
                  className={`absolute -inset-0.5 rounded-lg opacity-75 ${"bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-focus-within:opacity-100"} blur transition duration-200`}
                ></div>
                <input
                  type="text"
                  placeholder="Document name"
                  value={newDocumentName}
                  onChange={(e) => setNewDocumentName(e.target.value)}
                  className={`relative w-full p-3 rounded-lg border ${
                    theme
                      ? "bg-[#0c101d] border-gray-700 text-white focus:border-transparent"
                      : "bg-white border-gray-300 text-gray-900 focus:border-transparent"
                  } focus:outline-none`}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    theme
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDocument}
                  className="relative overflow-hidden group rounded-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
                  <div className="relative px-4 py-2 flex items-center justify-center text-white font-medium">
                    Create
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={() => setShowCreateFolderModal(false)}
        >
          <div
            className={`rounded-xl shadow-xl max-w-md w-full overflow-hidden ${
              theme ? "bg-[#111827] text-white" : "bg-white text-gray-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header with gradient */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>

            <div className="p-6">
              <h2
                className={`text-xl font-bold mb-1 ${
                  theme ? "text-white" : "text-gray-900"
                }`}
              >
                Create New Folder
              </h2>
              <p
                className={`text-sm mb-6 ${
                  theme ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Enter a name for your new folder
              </p>

              <div className="relative group mb-6">
                <div
                  className={`absolute -inset-0.5 rounded-lg opacity-75 ${"bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-focus-within:opacity-100"} blur transition duration-200`}
                ></div>
                <input
                  type="text"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className={`relative w-full p-3 rounded-lg border ${
                    theme
                      ? "bg-[#0c101d] border-gray-700 text-white focus:border-transparent"
                      : "bg-white border-gray-300 text-gray-900 focus:border-transparent"
                  } focus:outline-none`}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    theme
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="relative overflow-hidden group rounded-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
                  <div className="relative px-4 py-2 flex items-center justify-center text-white font-medium">
                    Create
                  </div>
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

