
import { useCallback, useEffect, useState, useRef } from "react";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import "../editor.css";
import "quill/dist/quill.snow.css";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Save,
  X,
  ChevronDown,
  Settings,
  Share2,
  Download,
  FileText,
  Moon,
  Sun,
  Menu,
  MessageSquare,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  PanelLeft,
  PanelRight,
  Maximize,
  Minimize,
  MoreVertical,
  History,
  Undo,
} from "lucide-react";
import useAppStore from "../store/useAppStore";

Quill.register("modules/cursors", QuillCursors);

const SAVE_INTERVAL_MS = 10000;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }], // Headers
  [{ font: [] }], // Fonts
  [{ size: ["small", false, "large", "huge"] }], // Font sizes
  [{ list: "ordered" }, { list: "bullet" }], // Lists
  [{ script: "sub" }, { script: "super" }], // Subscript/Superscript
  [{ indent: "-1" }, { indent: "+1" }], // Indent/Outdent
  [{ direction: "rtl" }], // Right-to-left text direction
  ["bold", "italic", "underline", "strike"], // Basic formatting
  [{ color: [] }, { background: [] }], // Text and background color
  [{ align: [] }], // Alignments
  ["link", "image", "video"], // Links, Images, and Videos
  ["blockquote", "code-block"], // Blockquote and code block
  [{ table: true }], // Table support (requires a plugin)
  ["clean"], // Remove formatting
];

export default function Editor() {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [userRole, setUserRole] = useState("none");
  const [activeUsers, setActiveUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [documentTitle, setDocumentTitle] = useState(
    documentId || "Untitled Document"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cursors, setCursors] = useState(null);
  const cursorsRef = useRef(null);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const user= useAppStore((state) => state.user);
  const userId=user._id;
  const userName=user.name;
  const editorContainerRef = useRef(null);

  // Mock comments for UI demonstration
  const comments = [
    {
      id: 1,
      user: "Alex Johnson",
      text: "I think we should expand on this section with more details about the implementation.",
      timestamp: "2 hours ago",
      resolved: false,
    },
    {
      id: 2,
      user: "Sarah Miller",
      text: "Great explanation here! Very clear and concise.",
      timestamp: "Yesterday",
      resolved: false,
    },
    {
      id: 3,
      user: "Michael Chen",
      text: "Let's add a diagram to illustrate this concept better.",
      timestamp: "3 days ago",
      resolved: true,
    },
  ];

  // Mock history for UI demonstration
  const history = [
    {
      id: 1,
      user: "Alex Johnson",
      action: "Edited paragraph",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      user: "You",
      action: "Added image",
      timestamp: "Yesterday",
    },
    {
      id: 3,
      user: "Sarah Miller",
      action: "Formatted text",
      timestamp: "3 days ago",
    },
  ];

  useEffect(() => {
    const s = io("https://collabedit-n5qv.onrender.com", {
      withCredentials: true,
    });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleActiveUsers = (users) => {
      setActiveUsers(users);
    };

    socket.on("active-users", handleActiveUsers);

    return () => socket.off("active-users", handleActiveUsers);
  }, [socket]);

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        cursors: {
          transformOnTextChange: true,
          selectionChangeSource: null,
        },
      },
    });
    const cursorsModule = q.getModule("cursors");
    setCursors(cursorsModule);
    cursorsRef.current = cursorsModule;
    q.disable();
    q.setText("Loading...");
    setQuill(q);

    // Set up text counters
    q.on("text-change", () => {
      const text = q.getText();
      setCharCount(text.length - 1); // Subtract 1 to account for trailing newline
      setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
    });
  }, []);

  // Load document on connect
  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();

      // Update counts after document loads
      const text = quill.getText();
      setCharCount(text.length - 1);
      setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
    });

    socket.once("user-role", (role) => {
      setUserRole(role);
      console.log("User role:", role);
      if (role === "viewer" || role === "none") {
        quill.disable(); // Properly disables the editor
      } else {
        quill.enable();
      }
    });

    socket.emit("get-document", documentId);

    return () => socket.off("load-document");
  }, [socket, quill, documentId]);
  useEffect(() => {
    if (!socket || !quill) return;

    const handleSelectionChange = (range, oldRange, source) => {
      if (source !== "user" || range == null) return;

      socket.emit("cursor-position", {
        userId, // Your unique user ID
        range,
        name: userName, // Optional: Display name
        color: getRandomColor(userId), // You already have this function
      });
    };
    
    quill.on("selection-change", handleSelectionChange);

    return () => {
      quill.off("selection-change", handleSelectionChange);
    };
  }, [socket, quill, userId,userName]);
  useEffect(() => {
    if (!socket || !quill || !cursorsRef.current) return;

    const cursors = cursorsRef.current;

    const handleCursorPosition = ({ userId: remoteId, range, name, color }) => {
      if (remoteId === userId) return;

      // Create cursor if it doesn't exist
      if (!cursors.cursors()[remoteId]) {
        cursors.createCursor(remoteId, name, color || "#F97316");
      }

      // Update cursor position
      cursors.moveCursor(remoteId, range);
    };

    socket.on("cursor-position", handleCursorPosition);
    socket.on("user-left", (remoteId) => {
      if (cursors.cursors()[remoteId]) {
        cursors.removeCursor(remoteId);
      }
    });

    return () => {
      socket.off("cursor-position", handleCursorPosition);
      socket.off("user-left");
    };
  }, [socket, quill, userId, cursorsRef.current]);
 
  console.log("Cursors module:", cursors);
  
  // Save document at intervals
  const handleSave = () => {
    if (socket == null || quill == null) return;

    setIsSaving(true);
    socket.emit("save-document", quill.getContents());

    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 500);
  };
  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      handleSave();
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [socket, quill]);

  // Broadcast changes made by the user
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handleChange = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handleChange);

    return () => quill.off("text-change", handleChange);
  }, [socket, quill]);

  // Apply changes received from others
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handleReceiveChanges = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handleReceiveChanges);

    return () => socket.off("receive-changes", handleReceiveChanges);
  }, [socket, quill]);

  // Handle fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      editorContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  function getInitials(name) {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function getRandomColor(userId) {
    // Generate a consistent color based on userId
    const colors = [
      "bg-emerald-500",
      "bg-sky-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-violet-500",
      "bg-fuchsia-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-orange-500",
    ];

    // Simple hash function to get a consistent index
    const hash = userId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      ref={editorContainerRef}
      className={`flex flex-col h-screen ${
        theme ? "bg-[#0a0d14] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`flex items-center justify-between px-4 md:px-6 py-2 z-10 backdrop-blur-xl ${
          theme
            ? "bg-[#111827]/80 border-b border-gray-800/50"
            : "bg-white/80 border-b border-gray-200/50 shadow-sm"
        }`}
      >
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden mr-2 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full blur-md bg-gradient-to-r from-blue-600 to-indigo-600 opacity-70"></div>
              <FileText className="h-6 w-6 relative text-blue-600" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className={`font-medium focus:outline-none focus:border-b-2 focus:border-blue-500 ${
                    theme
                      ? "bg-transparent text-white"
                      : "bg-transparent text-gray-900"
                  } ${
                    userRole === "viewer" || userRole === "none"
                      ? "cursor-not-allowed"
                      : ""
                  }`}
                  disabled={userRole === "viewer" || userRole === "none"}
                />
                <div
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    userRole === "viewer"
                      ? theme
                        ? "bg-gray-800 text-gray-400"
                        : "bg-gray-200 text-gray-600"
                      : theme
                      ? "bg-blue-900/30 text-blue-400 border border-blue-800/30"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {userRole === "viewer" ? "Viewer" : "Editor"}
                </div>
              </div>

              <div className="flex items-center text-xs mt-0.5">
                {isSaving ? (
                  <span
                    className={`flex items-center gap-1 ${
                      theme ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Loader2 size={12} className="animate-spin" />
                    Saving...
                  </span>
                ) : lastSaved ? (
                  <span className={theme ? "text-gray-400" : "text-gray-500"}>
                    Saved at {formatTime(lastSaved)}
                  </span>
                ) : (
                  <span className={theme ? "text-gray-400" : "text-gray-500"}>
                    Not saved yet
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Document stats - hidden on mobile */}
          <div className="hidden md:flex items-center gap-3 mr-2">
            <div
              className={`text-xs ${theme ? "text-gray-400" : "text-gray-500"}`}
            >
              {wordCount} words | {charCount} characters
            </div>
          </div>

          {/* Active users dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUsers(!showUsers)}
              className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
                theme
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <div className="flex -space-x-2 overflow-hidden">
                {activeUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.userId}
                    title={user.username}
                    className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-medium ring-1 ${
                      theme ? "ring-gray-900" : "ring-white"
                    } ${getRandomColor(user.userId)}`}
                  >
                    {getInitials(user.username)}
                  </div>
                ))}
                {activeUsers.length > 3 && (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ring-1 ${
                      theme
                        ? "bg-gray-800 text-gray-300 ring-gray-900"
                        : "bg-gray-200 text-gray-600 ring-white"
                    }`}
                  >
                    +{activeUsers.length - 3}
                  </div>
                )}
              </div>
              <ChevronDown
                size={14}
                className={theme ? "text-gray-400" : "text-gray-500"}
              />
            </button>

            {showUsers && (
              <div
                className={`absolute right-0 mt-2 w-64 rounded-xl shadow-lg py-1 z-20 border ${
                  theme
                    ? "bg-[#111827] border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                  <h3
                    className={`text-sm font-semibold ${
                      theme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Active Users ({activeUsers.length})
                  </h3>
                </div>
                <div className="max-h-60 overflow-y-auto p-2">
                  <div className="space-y-2">
                    {activeUsers.map((user) => (
                      <div
                        key={user.userId}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <div
                          className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-medium ${getRandomColor(
                            user.userId
                          )}`}
                        >
                          {getInitials(user.username)}
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-medium ${
                              theme ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {user.username}
                            {user.userId === socket?.id && (
                              <span
                                className={`ml-1 text-xs ${
                                  theme ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                (you)
                              </span>
                            )}
                          </span>
                          <span
                            className={`text-xs ${
                              theme ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {user.role || "Viewer"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comments button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              theme
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-200 text-gray-700"
            } ${showComments ? (theme ? "bg-gray-800" : "bg-gray-200") : ""}`}
          >
            <MessageSquare size={16} />
            <span className="text-sm">
              {comments.filter((c) => !c.resolved).length}
            </span>
          </button>

          {/* History button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              theme
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-200 text-gray-700"
            } ${showHistory ? (theme ? "bg-gray-800" : "bg-gray-200") : ""}`}
          >
            <History size={16} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(!theme)}
            className={`hidden md:flex items-center justify-center p-2 rounded-lg transition-colors ${
              theme
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-200 text-gray-700"
            }`}
            aria-label={theme ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className={`hidden md:flex items-center justify-center p-2 rounded-lg transition-colors ${
              theme
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          {/* Settings dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                theme
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <MoreVertical size={18} />
            </button>

            {showSettings && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 z-20 border ${
                  theme
                    ? "bg-[#111827] border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="py-1">
                  <button
                    className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                      theme
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Share2 size={16} className="mr-2 opacity-70" />
                    Share
                  </button>
                  <button
                    className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                      theme
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Download size={16} className="mr-2 opacity-70" />
                    Export
                  </button>
                  <button
                    className={`md:hidden flex items-center w-full text-left px-4 py-2 text-sm ${
                      theme
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setTheme(!theme)}
                  >
                    {theme ? (
                      <>
                        <Sun size={16} className="mr-2 opacity-70" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon size={16} className="mr-2 opacity-70" />
                        Dark Mode
                      </>
                    )}
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
                </div>
                <div
                  className={`border-t py-1 ${
                    theme ? "border-gray-800" : "border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => navigate("/dashboard")}
                    className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                      theme
                        ? "text-red-400 hover:bg-gray-800"
                        : "text-red-600 hover:bg-gray-100"
                    }`}
                  >
                    <X size={16} className="mr-2" />
                    Exit Editor
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save/Exit button */}
          <button
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              userRole === "viewer"
                ? theme
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            }`}
            onClick={() => {
              handleSave();
              setTimeout(() => {
                navigate("/dashboard");
              }, 500);
            }}
          >
            {userRole === "viewer" ? (
              <>
                <X size={16} />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div
          className={`md:hidden ${
            theme
              ? "bg-[#111827] border-b border-gray-800"
              : "bg-white border-b border-gray-200"
          }`}
        >
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div
                className={`text-xs ${
                  theme ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {wordCount} words | {charCount} characters
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className={`flex items-center gap-1 p-2 rounded-lg ${
                    theme
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-200"
                  } ${
                    showComments ? (theme ? "bg-gray-800" : "bg-gray-200") : ""
                  }`}
                >
                  <MessageSquare size={16} />
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex items-center gap-1 p-2 rounded-lg ${
                    theme
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-200"
                  } ${
                    showHistory ? (theme ? "bg-gray-800" : "bg-gray-200") : ""
                  }`}
                >
                  <History size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content area with sidebar panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - history */}
        {showHistory && (
          <aside
            className={`w-64 border-r overflow-y-auto flex-shrink-0 ${
              theme
                ? "bg-[#111827] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-medium ${
                    theme ? "text-white" : "text-gray-900"
                  }`}
                >
                  Version History
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className={`p-1 rounded-lg ${
                    theme
                      ? "hover:bg-gray-800 text-gray-400"
                      : "hover:bg-gray-200 text-gray-500"
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg cursor-pointer ${
                      theme
                        ? "hover:bg-gray-800/50 bg-gray-800/30"
                        : "hover:bg-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium ${
                          theme ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.user}
                      </span>
                      <div className="flex gap-1">
                        <button
                          className={`p-1 rounded ${
                            theme
                              ? "hover:bg-gray-700 text-gray-400"
                              : "hover:bg-gray-200 text-gray-500"
                          }`}
                        >
                          <Undo size={14} />
                        </button>
                      </div>
                    </div>
                    <p
                      className={`text-xs ${
                        theme ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {item.action}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        theme ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {item.timestamp}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main editor */}
        <main
          className={`flex-1 flex flex-col overflow-hidden ${
            theme ? "bg-[#0a0d14]" : "bg-gray-50"
          }`}
        >
          {/* Toolbar will be rendered by Quill */}
          <div
            className={`flex-1 overflow-y-auto px-4 md:px-8 py-6 ${
              theme ? "quill-dark" : ""
            }`}
            ref={wrapperRef}
          >
            {/* Quill editor mounts here */}
          </div>
        </main>

        {/* Right sidebar - comments */}
        {showComments && (
          <aside
            className={`w-72 border-l overflow-y-auto flex-shrink-0 ${
              theme
                ? "bg-[#111827] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-medium ${
                    theme ? "text-white" : "text-gray-900"
                  }`}
                >
                  Comments
                </h3>
                <button
                  onClick={() => setShowComments(false)}
                  className={`p-1 rounded-lg ${
                    theme
                      ? "hover:bg-gray-800 text-gray-400"
                      : "hover:bg-gray-200 text-gray-500"
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg ${
                      comment.resolved
                        ? theme
                          ? "bg-gray-800/20"
                          : "bg-gray-50"
                        : theme
                        ? "bg-gray-800/50"
                        : "bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium ${
                          theme ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {comment.user}
                      </span>
                      <span
                        className={`text-xs ${
                          theme ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        {comment.timestamp}
                      </span>
                    </div>
                    <p
                      className={`text-sm mb-2 ${
                        comment.resolved
                          ? theme
                            ? "text-gray-400"
                            : "text-gray-500"
                          : theme
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      {comment.text}
                    </p>
                    <div className="flex justify-between items-center">
                      <button
                        className={`text-xs ${
                          theme
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-blue-600 hover:text-blue-700"
                        }`}
                      >
                        Reply
                      </button>
                      <button
                        className={`text-xs ${
                          comment.resolved
                            ? theme
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-500 hover:text-gray-700"
                            : theme
                            ? "text-green-400 hover:text-green-300"
                            : "text-green-600 hover:text-green-700"
                        }`}
                      >
                        {comment.resolved ? "Reopen" : "Resolve"}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add comment form */}
                <div
                  className={`mt-4 p-3 rounded-lg border ${
                    theme ? "border-gray-800" : "border-gray-200"
                  }`}
                >
                  <textarea
                    placeholder="Add a comment..."
                    className={`w-full p-2 text-sm rounded-md border ${
                      theme
                        ? "bg-[#0c101d] border-gray-700 text-white focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    rows={3}
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button
                      className={`px-3 py-1 text-xs rounded-md ${
                        theme
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Status bar */}
      <footer
        className={`flex items-center justify-between px-4 py-1.5 text-xs border-t ${
          theme
            ? "bg-[#111827] border-gray-800 text-gray-400"
            : "bg-white border-gray-200 text-gray-500"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>
              Auto-saved {lastSaved ? formatTime(lastSaved) : "never"}
            </span>
          </div>
          <div>
            {wordCount} words | {charCount} characters
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={`flex items-center gap-1 ${
              theme ? "hover:text-gray-300" : "hover:text-gray-700"
            }`}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <PanelRight size={14} /> : <PanelLeft size={14} />}
            <span className="hidden md:inline">
              {showSidebar ? "Hide panels" : "Show panels"}
            </span>
          </button>
          <button
            className={`flex items-center gap-1 ${
              theme ? "hover:text-gray-300" : "hover:text-gray-700"
            }`}
            onClick={() => {
              if (userRole === "viewer") {
                // Toggle view-only mode for viewers
                if (quill.isEnabled()) {
                  quill.disable();
                } else {
                  quill.enable();
                }
              }
            }}
          >
            {quill?.isEnabled() ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden md:inline">
              {quill?.isEnabled() ? "View only" : "Interactive"}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}
