const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema(
  {
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "placementDrive",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["aptitude", "technical", "interview"],
      required: true
    },

    sequence: {
      type: Number,
      required: true,
      min: 1
    },

    shortlistType: {
      type: String,
      enum: ["TOP_N", "THRESHOLD"],
      required: true
    },

    shortlistValue: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Round", roundSchema);  