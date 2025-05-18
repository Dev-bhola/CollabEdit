const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const mongoDBPass = process.env.MONGO_DB_PASS;;
const { z } = require("zod");
const userModel = require("./models/user");
const SECRET = process.env.JWT_SECRET;
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST"],
};
const Document = require("./models/Document");
const user = require("./models/user");
mongoose
  .connect(
    `mongodb+srv://devb2005:${mongoDBPass}@cluster0.oqdbe.mongodb.net/text-editor`
  )
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
async function authenticateSocket(socket, next) {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, SECRET);
    const currentUser = await user.findOne({ email: decoded.email });
    socket.userId = currentUser._id;
    socket.userRole = null;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
}

io.use(authenticateSocket);
io.on("connection", (socket) => {
  socket.on("get-document", async (title) => {
    const userId = socket.userId;
    const document = await findOrCreateDocument(title, userId);

    if (
      document.roles.editors &&
      document.roles.editors.some((id) => id.equals(socket.userId))
    ) {
      socket.userRole = "editor";
    } else if (
      document.roles.viewers &&
      document.roles.viewers.some((id) => id.equals(socket.userId))
    ) {
      socket.userRole = "viewer";
    } else if (
      document.roles.creator &&
      document.roles.creator.equals(socket.userId)
    ) {
      socket.userRole = "creator";
    } else {
      socket.userRole = "none";
    }

    socket.join(document._id.toString());
    socket.emit("load-document", document.content);
    socket.emit("user-role", socket.userRole);

    socket.on("send-changes", (delta) => {
      if (socket.userRole === "viewer" || socket.userRole === "none") return;
      socket.broadcast
        .to(document._id.toString())
        .emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      if (socket.userRole === "viewer" || socket.userRole === "none") return;
      try {
        await Document.findByIdAndUpdate(document._id, {
          content: data,
          updatedAt: Date.now(),
          lastModifiedBy: userId,
        });
      } catch (error) {
        console.error("Error saving document:", error);
      }
    });

    socket.on("save-document", async (data) => {
      if (socket.userRole === "viewer") return;
      try {
        await Document.findByIdAndUpdate(document._id, {
          content: data,
          updatedAt: Date.now(),
          lastModifiedBy: userId,
        });
      } catch (error) {
        console.error("Error saving document:", error);
      }
    });
  });
});
async function authenticateUser(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET); 
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

app.use(express.json());
app.use(cors(corsOptions));

const userSchema = z.object({
  name: z
    .string()
    .min(3, "Name is required")
    .max(50, "Name must be under 50 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  age: z.number().positive().optional(),
});

app.post("/signup", async (req, res) => {
  const userData = req.body;
  try {
    const validatedData = userSchema.parse(userData);

    const checkUser = await userModel.findOne({ email: validatedData.email });
    if (checkUser) {
      return res.status(409).send("This email is already registered");
    }

    const createUser = async (name, age, email, password) => {
      try {
        const salt = await bcrypt.genSalt(10);

        const hash = await bcrypt.hash(password, salt);

        const createdUser = await userModel.create({
          name,
          age,
          email,
          password: hash,
        });

        return createdUser;
      } catch (err) {
        console.error("Error during user creation:", err);
        throw err;
      }
    };
    const createdUser = await createUser(
      validatedData.name,
      validatedData.age,
      validatedData.email,
      validatedData.password
    );
    const token = jwt.sign(
      { email: createdUser.email, userId: createdUser._id },
      SECRET
    );


    res.status(201).json({ message: "Signup successful!", token });
  } catch (err) {
    res.status(400).json({ error: err.errors });
  }
});
app.post("/login", async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error comparing passwords" });
      }
      if (!result) {
        return res.status(400).json({ message: "Incorrect password" });
      }
      const token = jwt.sign({ email: user.email, userId: user._id }, SECRET, {
        expiresIn: req.body.rememberMe ? "7d" : "1h",
      });

      if (req.body.rememberMe) {
        res.status(200).json({ message: "Login successful", token });
      } else {
       
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", 
          maxAge: 3600000, 
        });
        res.status(200).json({ message: "Login successful", token });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

async function findOrCreateDocument(title, userId) {
  
  if (!title) return;

  const document = await Document.findOne({ title });
  if (document) return document;

  console.log("title",title)
  console.log('userId',userId);
  const newDocument = await Document.create({
    title, 
    content: "",
    roles: {
      creator: userId,
    }, 
    lastModifiedBy: userId, 
  });
  console.log("New document created:", newDocument);
  await user.findByIdAndUpdate(userId, {
    $push: { documents: newDocument._id },
  });
  
  return newDocument;
}
app.get("/documents", authenticateUser, async (req, res) => {
  try {
    const data = await user.findById(req.user.userId).populate("documents"); 

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/documents/delete", async (req, res) => {
  const { data } = req.body;

  try {
    const result = await Document.findByIdAndDelete(data);

    if (!result) {
      return res.status(404).send("Document not found");
    }
    res.status(200).send("Document deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
app.post("/documents/share", authenticateUser, async (req, res) => {
  const { documentId, email, role } = req.body;
  try {
    const targetUser = await user.findOne({ email });
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const document = await Document.findById(documentId);
    if (!document)
      return res.status(404).json({ message: "Document not found" });

    const roleField = role + "s";

    // ...existing code...
    await Document.findByIdAndUpdate(documentId, {
      $addToSet: { [`roles.${roleField}`]: targetUser._id },
    });
    // Remove this line:
    // if(roleField==='viewers') res.status(200).json({ message: "Document shared successfully" });
    await user.findByIdAndUpdate(targetUser._id, {
      $addToSet: { documents: documentId },
    });

    res.status(200).json({ message: "Document shared successfully" });
    // ...existing code...
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const PORT = process.env.PORT || 3000;;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
