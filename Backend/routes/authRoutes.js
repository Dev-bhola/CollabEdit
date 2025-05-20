const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  checkAuth,
} = require("../controllers/authController");
const { authenticateUser } = require("../middleware/authenticateUser");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check", authenticateUser, checkAuth);

module.exports = router;
