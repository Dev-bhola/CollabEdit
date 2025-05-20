const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../models/user");

const SECRET = process.env.JWT_SECRET;

async function authenticateSocket(socket, next) {
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  const token = cookies.token;

  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) return next(new Error("User not found"));

    socket.userId = user._id;
    socket.username = user.name || user.email || "Unknown";
    socket.userRole = null;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
}

module.exports = { authenticateSocket };
