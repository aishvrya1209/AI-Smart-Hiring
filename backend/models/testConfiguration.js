
const mongoose = require("mongoose");

const testConfigurationSchema = new mongoose.Schema(
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

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: ["APTITUDE", "TECHNICAL", "HR"],
      required: true
    },

    questionType: {
      type: String,
      enum: ["MCQ"],
      default: "MCQ"
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1
    },

    totalMarks: {
      type: Number,
      required: true,
      min: 1
    },

    passingMarks: {
      type: Number,
      required: true,
      min: 0
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      required: true
    },

    topics: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        questionCount: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],

    marksPerQuestion: {
      type: Number,
      required: true,
      min: 0
    },

    negativeMarks: {
      type: Number,
      default: 0,
      min: 0
    },

    randomizeQuestions: {
      type: Boolean,
      default: true
    },

    randomizeOptions: {
      type: Boolean,
      default: true
    },

    maxAttempts: {
      type: Number,
      default: 1,
      min: 1
    },

    instructions: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE"],
      default: "DRAFT"
    }
  },
  { timestamps: true }
);

// One configuration per round
testConfigurationSchema.index(
  { roundId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "TestConfiguration",
  testConfigurationSchema
);
