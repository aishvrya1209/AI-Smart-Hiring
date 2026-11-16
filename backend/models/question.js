
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementDrive",
      required: true
    },

    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Round",
      required: true
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    questionText: {
      type: String,
      required: true,
      trim: true
    },

    questionType: {
      type: String,
      enum: ["MCQ", "CODING", "SUBJECTIVE"],
      default: "MCQ"
    },

    category: {
      type: String,
      enum: ["APTITUDE", "TECHNICAL", "HR"],
      required: true
    },

    topic: {
      type: String,
      required: true
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "MEDIUM"
    },

    options: [
      {
        text: {
          type: String,
          required: true
        },
        isCorrect: {
          type: Boolean,
          default: false
        }
      }
    ],

    correctAnswer: String,

    explanation: String,

    marks: {
      type: Number,
      default: 1
    },

    negativeMarks: {
      type: Number,
      default: 0
    },

    source: {
      type: String,
      enum: ["AI", "COMPANY", "PLATFORM"],
      default: "AI"
    },

    status: {
      type: String,
      enum: ["DRAFT", "APPROVED", "PUBLISHED"],
      default: "DRAFT"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
