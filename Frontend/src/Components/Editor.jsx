import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "../editor.css";
import "quill/dist/quill.snow.css";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { io } from "socket.io-client";

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

  useEffect(() => {
    console.log("Token in cookie:", document.cookie);
    const s = io("http://localhost:3000", {
      withCredentials:true,
    });
    setSocket(s);
    return () => s.disconnect();
  }, []);

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

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <button
        className="absolute top-4 right-4 px-5 py-2 bg-white text-black border rounded shadow z-10"
        onClick={() => {
          setTimeout(() => {
            navigate("/dashboard");
          }, 500);
        }}
      >
        {userRole === "viewer" ? "Exit" : "Save"}
      </button>
  
      <div
        className="flex-1 mt-16 overflow-y-auto"
        ref={wrapperRef}
      >
        {/* Quill editor mounts here */}
      </div>
    </div>
  );
  
  
  
}
