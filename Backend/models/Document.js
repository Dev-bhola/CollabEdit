const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Ensure title is always provided
  },
  content: {
    type: Object, // Keep content as an object
    default: {}, // Default to an empty object
  },
  roles: {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true, // Ensure there's always a creator
    },
    editors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: [],
      },
    ],
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: [],
      },
    ],
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("document", documentSchema);
