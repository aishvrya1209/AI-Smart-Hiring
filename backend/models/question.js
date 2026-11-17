

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    // Placement drive reference
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "placementDrive",
      required: true
    },

    // Interview round reference
    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Round",
      required: true
    },

    // Company reference
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    // Question content
    questionText: {
      type: String,
      required: true,
      trim: true
    },

    // Question type
    questionType: {
      type: String,
      enum: ["MCQ", "CODING", "SUBJECTIVE"],
      default: "MCQ"
    },

    // Interview category
    category: {
      type: String,
      enum: ["APTITUDE", "TECHNICAL", "HR"],
      required: true
    },

    // Question topic
    topic: {
      type: String,
      required: true,
      trim: true
    },

    // Difficulty level
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "MEDIUM"
    },

    // MCQ options
    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true
        },

        isCorrect: {
          type: Boolean,
          default: false
        }
      }
    ],

    // Correct answer
    correctAnswer: {
      type: String,
      trim: true
    },

    // Answer explanation
    explanation: {
      type: String,
      trim: true
    },

    // Marks for correct answer
    marks: {
      type: Number,
      default: 1,
      min: 0
    },

    // Negative marks for incorrect answer
    negativeMarks: {
      type: Number,
      default: 0,
      min: 0
    },

    // Question source
    source: {
      type: String,
      enum: ["AI", "COMPANY", "PLATFORM"],
      default: "AI"
    },

    // Question approval status
    status: {
      type: String,
      enum: [
        "DRAFT",
        "APPROVED",
        "REJECTED",
        "PUBLISHED"
      ],
      default: "DRAFT"
    }
  },
  {
    timestamps: true
  }
);

// Helpful indexes for retrieving questions
questionSchema.index({
  driveId: 1,
  roundId: 1,
  status: 1
});

questionSchema.index({
  companyId: 1,
  driveId: 1
});

module.exports = mongoose.model("Question", questionSchema);
