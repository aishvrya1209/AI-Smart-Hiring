
const Question = require("../models/question");
const Round = require("../models/round");
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

    // Get company ID from authenticated JWT
    const companyId = req.user.id;

    // Basic validation
    if (
      !companyId ||
      !driveId ||
      !roundId ||
      !role ||
      !category ||
      !difficulty ||
      !count ||
      !Array.isArray(topics) ||
      topics.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    if (!["APTITUDE", "TECHNICAL", "HR"].includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview category"
      });
    }

    if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty level"
      });
    }

    if (!Number.isInteger(count) || count < 5 || count > 50) {
      return res.status(400).json({
        success: false,
        message: "Question count must be between 5 and 50"
      });
    }

    // Check whether the round exists
    const round = await Round.findById(roundId);

    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Interview round not found"
      });
    }

    // Verify this round belongs to the selected drive.
    // Adjust the field name if your Round schema uses another name.
    if (String(round.driveId) !== String(driveId)) {
      return res.status(400).json({
        success: false,
        message: "Round does not belong to this placement drive"
      });
    }

    // TODO: Also verify that the authenticated company owns driveId,
    // using the actual company ownership field in PlacementDrive.js.

    // Generate questions using AI
    const questions = await generateQuestions({
      role,
      round: category,
      difficulty,
      count,
      topics
    });

    // Prepare database documents
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
      marks: q.marks || 1,
      negativeMarks: q.negativeMarks || 0,
      source: "AI",
      status: "DRAFT"
    }));

    // Save questions in MongoDB
    const savedQuestions = await Question.insertMany(
      questionDocuments
    );

    return res.status(201).json({
      success: true,
      message: "AI questions generated successfully",
      totalQuestions: savedQuestions.length,
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

module.exports = { generateAIQuestions };