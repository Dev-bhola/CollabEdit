import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import "../editor.css";
import "quill/dist/quill.snow.css";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { io } from "socket.io-client";
import { Save, X, Users } from "lucide-react";

Quill.register("modules/cursors", QuillCursors);

const SAVE_INTERVAL_MS = 2000;
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
  useEffect(() => {
    const s = io("http://localhost:3000", {
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
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

  // Load document on connect
  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
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

  // Save document at intervals
  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Users size={16} />
            <span>
              {activeUsers.length} {activeUsers.length === 1 ? "user" : "users"}
            </span>
          </button>

          {showUsers && (
            <div className="absolute top-14 left-6 z-50 p-3 bg-white rounded-md shadow-lg border border-gray-200">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">
                Active Users
              </h3>
              <div className="flex flex-col space-y-2">
                {activeUsers.map((user) => (
                  <div key={user.userId} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-medium ${getRandomColor(
                        user.userId
                      )}`}
                    >
                      {getInitials(user.username)}
                    </div>
                    <span className="text-sm text-gray-800">
                      {user.username}
                    </span>
                    {user.userId === socket?.id && (
                      <span className="text-xs text-gray-500">(you)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            userRole === "viewer"
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          }`}
          onClick={() => {
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
      </header>

      {/* Active users avatars - horizontal bar */}
      <div className="flex px-6 py-2 bg-white border-b border-gray-200">
        <div className="flex -space-x-2 overflow-hidden">
          {activeUsers.slice(0, 5).map((user) => (
            <div
              key={user.userId}
              title={user.username}
              className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-medium ring-2 ring-white ${getRandomColor(
                user.userId
              )}`}
            >
              {getInitials(user.username)}
            </div>
          ))}
          {activeUsers.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium ring-2 ring-white">
              +{activeUsers.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Editor container */}
      <div className="flex-1 overflow-y-auto px-6 py-4" ref={wrapperRef}>
        {/* Quill editor mounts here */}
      </div>
    </div>
  );
}