const mongoose = require("mongoose");

const roundResultSchema = new mongoose.Schema(
  {
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "placementDrive",
      required: true
    },

    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Round",
      required: true
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateProfile",
      required: true
    },

    marks: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ["PENDING", "SHORTLISTED", "REJECTED"],
      default: "PENDING"
    }
  },
  {
    timestamps: true
  }
);

roundResultSchema.index(
  {
    driveId: 1,
    roundId: 1,
    candidateId: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  "RoundResult",
  roundResultSchema
);