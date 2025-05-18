const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const crypto = require("crypto");
const cookie = require("cookie");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const mongoDBPass = process.env.MONGO_DB_PASS;;
const { z } = require("zod");
const userModel = require("./models/user");
const SECRET = process.env.JWT_SECRET;
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST"],
  credentials: true,
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
    credentials: true,
  },
});
async function authenticateSocket(socket, next) {
  // Parse cookies from handshake headers
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  const token = cookies.token;
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
    console.log(socket.userRole);
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
const User = require("./models/user"); // adjust the path

async function authenticateUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  console.log(token);
  try {
    const decoded = jwt.verify(token, SECRET);
    console.log("Decoded token in middleware:", decoded);
    const user = await User.findById(decoded.userId);// depends how you signed the token
    if (!user) {
      return res.status(401).json({ message: "User Not found" });
    }
    console.log(user);

    req.user = user; // ✅ now req.user._id works!
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}


app.use(express.json());
app.use(cookieParser());  
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

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
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(201).json({ message: "Signup successful!"});
  } catch (err) {
    res.status(400).json({ error: err.errors });
  }
});
app.post("/login", async (req, res) => {
  try {
    console.log(req.body.email);
    const user = await userModel.findOne({ email: req.body.email });
    console.log(user);

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

      // Always set the cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: req.body.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
      });

      res.status(200).json({ message: "Login successful" });
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
      editors: [],
      viewers: [],
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
    const data = await user.findById(req.user._id).populate("documents"); 

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
  console.log("req.user._id:", req.user?._id);
  try {
    // 1. Validate the role
    if (!["viewer", "editor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 2. Find the user with that email
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res
        .status(404)
        .json({ message: "No user found with this email." });
    }

    // 3. Prevent sharing with yourself
    if (req.user._id.toString() === targetUser._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot share a document with yourself." });
    }

    // 4. Find the document
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }
    console.log("document.roles.creator:", document.roles.creator);
    
    // 5. Defensive: make sure roles object is always initialized
    if (!document.roles) {
      document.roles = { creator: null, editors: [], viewers: [] };
    }
    if (!document.roles.editors) document.roles.editors = [];
    if (!document.roles.viewers) document.roles.viewers = [];

    // 6. Check if requester is the creator
    
    if (
      !document.roles.creator ||
      document.roles.creator.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Only the document creator can share it." });
    }

    const targetRoleField = role + "s"; // viewers or editors
    const currentRoles = document.roles;

    // 7. Remove from previous roles if present
    const rolesToRemoveFrom = ["editors", "viewers"].filter(
      (r) => r !== targetRoleField
    );
    let roleChanged = false;

    for (const field of rolesToRemoveFrom) {
      if (
        currentRoles[field].some(
          (id) => id.toString() === targetUser._id.toString()
        )
      ) {
        await Document.findByIdAndUpdate(documentId, {
          $pull: { [`roles.${field}`]: targetUser._id },
        });
        roleChanged = true;
      }
    }

    // 8. Add to target role if not already there
    const alreadyInTargetRole = currentRoles[targetRoleField].some(
      (id) => id.toString() === targetUser._id.toString()
    );

    if (!alreadyInTargetRole) {
      await Document.findByIdAndUpdate(documentId, {
        $addToSet: { [`roles.${targetRoleField}`]: targetUser._id },
      });
      await user.findByIdAndUpdate(targetUser._id, {
        $addToSet: { documents: documentId },
      });
    }

    const message = alreadyInTargetRole
      ? `User already has the role '${role}'.`
      : roleChanged
      ? `Updated user role to '${role}'.`
      : `User assigned role '${role}' successfully.`;

    res.status(200).json({ message });
  } catch (error) {
    console.error("Error sharing document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


const PORT = process.env.PORT || 3000;;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
