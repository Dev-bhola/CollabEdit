const Document = require("../models/Document");
const userModel = require("../models/user");

exports.getUserDocuments = async (req, res) => {
  try {
    
    const user = await userModel.findById(req.user._id).populate("documents");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteDocument = async (req, res) => {
  const { data } = req.body;
  try {
    const result = await Document.findByIdAndDelete(data);
    if (!result) return res.status(404).send("Document not found");
    res.status(200).send("Document deleted successfully");
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.shareDocument = async (req, res) => {
  const { documentId, email, role } = req.body;
  try {
    const targetUser = await userModel.findOne({ email });
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (req.user._id.toString() === targetUser._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot share with yourself." });
    }

    const document = await Document.findById(documentId);
    if (
      !document ||
      document.roles.creator.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Only the creator can share this document." });
    }

    const targetField = role + "s";

    for (const r of ["editors", "viewers"]) {
      if (r !== targetField) {
        await Document.findByIdAndUpdate(documentId, {
          $pull: { [`roles.${r}`]: targetUser._id },
        });
      }
    }

    await Document.findByIdAndUpdate(documentId, {
      $addToSet: { [`roles.${targetField}`]: targetUser._id },
    });

    await userModel.findByIdAndUpdate(targetUser._id, {
      $addToSet: { documents: documentId },
    });

    res.status(200).json({ message: `User shared as ${role}` });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
