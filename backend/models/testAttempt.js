const mongoose = require("mongoose");

const testAttemptSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateProfile",
      required: true
    },

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

    // Questions actually given to this candidate
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
      }
    ],

    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true
        },

        selectedAnswer: {
          type: String,
          default: null
        }
      }
    ],

    startedAt: {
      type: Date,
      default: Date.now
    },

    submittedAt: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["IN_PROGRESS", "SUBMITTED"],
      default: "IN_PROGRESS"
    },

    score: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

testAttemptSchema.index({
  candidateId: 1,
  roundId: 1
});

module.exports = mongoose.model("TestAttempt", testAttemptSchema);