const { Server } = require("socket.io");
const { authenticateSocket } = require("./auth");
const Document = require("../models/Document");
const userModel = require("../models/user");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
    "http://localhost:5173",
    "https://collab-edit-mci7x4gdv-dev-bholas-projects.vercel.app"
  ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  const activeUsers = new Map();
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    socket.on("get-document", async (title) => {
      const userId = socket.userId;
      const document = await findOrCreateDocument(title, userId);

      const role = getRole(document, socket.userId);
      socket.userRole = role;

      socket.join(document._id.toString());
      const docId = document._id.toString();

      // Initialize Map for this document if none exists
      if (!activeUsers.has(docId)) {
        activeUsers.set(docId, new Map());
      }

      // Add current user to active users
      activeUsers.get(docId).set(socket.id, {
        userId: socket.userId,
        username: socket.username || "Unknown", // make sure authenticateSocket sets socket.username
      });

      // Emit updated active user list (array of user info) to everyone in this room
      io.to(docId).emit(
        "active-users",
        Array.from(activeUsers.get(docId).values())
      );
      socket.emit("load-document", document.content);
      socket.emit("user-role", role);

      socket.on("send-changes", (delta) => {
        if (["viewer", "none"].includes(role)) return;
        socket.broadcast
          .to(document._id.toString())
          .emit("receive-changes", delta);
      });
      socket.on("cursor-position", ({ userId, range, name}) => {
        const docId = document._id.toString();
        const color= "#f97316";
        socket.broadcast.to(docId).emit("cursor-position", {
          userId,
          range,
          name,
          color,
        });
      });
      socket.on("save-document", async (data) => {
        if (["viewer", "none"].includes(role)) return;
        await Document.findByIdAndUpdate(document._id, {
          content: data,
          updatedAt: Date.now(),
          lastModifiedBy: userId,
        });
      });
      socket.on("disconnect", () => {
        if (!activeUsers.has(docId)) return;

        const usersMap = activeUsers.get(docId);
        usersMap.delete(socket.id);
        io.to(docId).emit("user-left", socket.userId);
        if (usersMap.size === 0) {
          activeUsers.delete(docId);
        } else {
          io.to(docId).emit("active-users", Array.from(usersMap.values()));
        }
      });
      
    });
  });
}

function getRole(document, userId) {
  if (document.roles.creator?.equals(userId)) return "creator";
  if (document.roles.editors?.some((id) => id.equals(userId))) return "editor";
  if (document.roles.viewers?.some((id) => id.equals(userId))) return "viewer";
  return "none";
}

async function findOrCreateDocument(title, userId) {
  if (!title) return null;

  let document = await Document.findOne({ title });
  if (document) return document;

  document = await Document.create({
    title,
    content: "",
    roles: { creator: userId, editors: [], viewers: [] },
    lastModifiedBy: userId,
  });

  await userModel.findByIdAndUpdate(userId, {
    $push: { documents: document._id },
  });

  return document;
}

module.exports = { setupSocket };
