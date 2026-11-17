
const mongoose = require("mongoose");

const Question = require("../models/question");
const Round = require("../models/round");
const PlacementDrive = require("../models/placementDrive");

const generateQuestions = require("../services/aiquestionservice");

const generateAIQuestions = async (req, res) => {
  try {
    const {
      driveId,
      roundId,
      role,
      category,
      difficulty,
      count,
      topics
    } = req.body;

    // Get authenticated company ID from JWT
    const companyId = req.user.id;

    // 1. Basic validation
    if (
      !companyId ||
      !driveId ||
      !roundId ||
      !role ||
      !category ||
      !difficulty ||
      count === undefined ||
      !Array.isArray(topics) ||
      topics.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // 2. Validate MongoDB ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(driveId) ||
      !mongoose.Types.ObjectId.isValid(roundId) ||
      !mongoose.Types.ObjectId.isValid(companyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid driveId, roundId or companyId"
      });
    }

    // 3. Validate role
    if (typeof role !== "string" || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid job role"
      });
    }

    // 4. Validate category
    if (!["APTITUDE", "TECHNICAL", "HR"].includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview category"
      });
    }

    // 5. Validate difficulty
    if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty level"
      });
    }

    // 6. Validate question count
    if (!Number.isInteger(count) || count < 5 || count > 50) {
      return res.status(400).json({
        success: false,
        message: "Question count must be between 5 and 50"
      });
    }

    // 7. Validate topics
    const cleanTopics = topics
      .filter(topic => typeof topic === "string")
      .map(topic => topic.trim())
      .filter(topic => topic.length > 0);

    if (
      cleanTopics.length !== topics.length ||
      cleanTopics.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid topics"
      });
    }

    // 8. Verify company owns the placement drive
    const drive = await PlacementDrive.findOne({
      _id: driveId,
      companyId: companyId
    });

    if (!drive) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this placement drive"
      });
    }

    // 9. Verify round exists and belongs to this drive
    const round = await Round.findOne({
      _id: roundId,
      driveId: driveId
    });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Interview round not found for this placement drive"
      });
    }

    // 10. Generate questions using Groq AI
    const questions = await generateQuestions({
      role: role.trim(),
      round: category,
      difficulty,
      count,
      topics: cleanTopics
    });

    // 11. Prepare question documents
    const questionDocuments = questions.map((q) => ({
      driveId,
      roundId,
      companyId,

      questionText: q.questionText,
      questionType: "MCQ",
      category,
      topic: q.topic,
      difficulty,

      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,

      marks: q.marks ?? 1,
      negativeMarks: q.negativeMarks ?? 0,

      source: "AI",
      status: "DRAFT"
    }));

    // 12. Save questions in MongoDB
    const savedQuestions = await Question.insertMany(
      questionDocuments
    );

    // 13. Success response
    return res.status(201).json({
      success: true,
      message: "AI questions generated successfully",
      totalQuestions: savedQuestions.length,
      driveId,
      roundId,
      questions: savedQuestions
    });

  } catch (error) {
    console.error("AI Question Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate questions"
    });
  }
};

module.exports = {
  generateAIQuestions
};
