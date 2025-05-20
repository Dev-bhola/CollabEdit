const express = require("express");
const router = express.Router();
const {
  getUserDocuments,
  deleteDocument,
  shareDocument,
} = require("../controllers/documentController");

const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/", authenticateUser, getUserDocuments);
router.post("/delete", deleteDocument);
router.post("/share", authenticateUser, shareDocument);

module.exports = router;
