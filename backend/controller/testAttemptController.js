const mongoose = require("mongoose");

const TestAttempt = require("../models/testAttempt");
const CandidateProfile = require("../models/candidateprofile");
const Application = require("../models/Application");
const PlacementDrive = require("../models/placementDrive");
const Round = require("../models/round");
const TestConfiguration = require("../models/testConfiguration");
const Question = require("../models/question");
const RoundResult = require("../models/roundResult");


// ================= START TEST =================
const startTest = async (req, res) => {
  try {
    const { driveId, roundId } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(driveId) ||
      !mongoose.Types.ObjectId.isValid(roundId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid driveId or roundId"
      });
    }

    // Find candidate profile
    const candidate = await CandidateProfile.findOne({
      userId: req.user.id
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found"
      });
    }

    // Check placement drive
    const drive = await PlacementDrive.findById(driveId);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found"
      });
    }

    // Check whether candidate applied
    const application = await Application.findOne({
      candidateId: candidate._id,
      driveId
    });

    if (!application) {
      return res.status(403).json({
        success: false,
        message: "You have not applied for this placement drive"
      });
    }

    // Check round
    const round = await Round.findOne({
      _id: roundId,
      driveId
    });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Round not found for this placement drive"
      });
    }

    // Check whether test configuration exists
    const configuration = await TestConfiguration.findOne({
      roundId,
      driveId
    });

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: "Test configuration not found"
      });
    }

    // Test must be active
    if (configuration.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "This test is not active"
      });
    }

    // Check maximum attempts
    const attemptCount = await TestAttempt.countDocuments({
      candidateId: candidate._id,
      roundId
    });

    if (attemptCount >= configuration.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: "Maximum attempts reached"
      });
    }

    // Get published MCQ questions
    const questions = await Question.find({
      driveId,
      roundId,
      status: "PUBLISHED",
      questionType: "MCQ"
    }).select(
      "_id questionText questionType category topic difficulty options"
    );

    // Make sure enough questions exist
    if (questions.length < configuration.totalQuestions) {
      return res.status(400).json({
        success: false,
        message: "Not enough published questions available"
      });
    }

    // Select questions
    let selectedQuestions = [...questions];

    if (configuration.randomizeQuestions) {
      selectedQuestions.sort(() => Math.random() - 0.5);
    }

    selectedQuestions = selectedQuestions.slice(
      0,
      configuration.totalQuestions
    );

    // Randomize options
    selectedQuestions = selectedQuestions.map((question) => {
      const questionObj = question.toObject();

      if (configuration.randomizeOptions) {
        questionObj.options = [...questionObj.options].sort(
          () => Math.random() - 0.5
        );
      }

      return questionObj;
    });

    // Create attempt
    const attempt = await TestAttempt.create({
      candidateId: candidate._id,
      driveId,
      roundId,

      // Store the exact questions given to this candidate
      questionIds: selectedQuestions.map(
        question => question._id
      ),

      answers: [],
      status: "IN_PROGRESS"
    });

    return res.status(201).json({
      success: true,
      message: "Test started successfully",

      attemptId: attempt._id,

      test: {
        title: configuration.title,
        durationMinutes: configuration.durationMinutes,
        totalQuestions: configuration.totalQuestions,
        totalMarks: configuration.totalMarks,
        negativeMarks: configuration.negativeMarks,
        instructions: configuration.instructions
      },

      questions: selectedQuestions
    });

  } catch (error) {
    console.error("Start test error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while starting test"
    });
  }
};


// ================= SUBMIT TEST =================
const submitTest = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    // Validate attempt ID
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attemptId"
      });
    }

    // Validate answers
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array"
      });
    }

    // Find candidate
    const candidate = await CandidateProfile.findOne({
      userId: req.user.id
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found"
      });
    }

    // Find candidate's attempt
    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      candidateId: candidate._id
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found"
      });
    }

    // Prevent resubmission
    if (attempt.status === "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Test has already been submitted"
      });
    }

    // Get test configuration
    const configuration = await TestConfiguration.findOne({
      driveId: attempt.driveId,
      roundId: attempt.roundId
    });

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: "Test configuration not found"
      });
    }

    // Validate every submitted question
    for (const answer of answers) {

      if (!mongoose.Types.ObjectId.isValid(answer.questionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid questionId"
        });
      }

      const questionWasInAttempt =
        attempt.questionIds.some(
          questionId =>
            questionId.toString() ===
            answer.questionId.toString()
        );

      if (!questionWasInAttempt) {
        return res.status(400).json({
          success: false,
          message: "Question was not part of this test"
        });
      }
    }

    // Prevent duplicate answers
    const submittedQuestionIds = new Set();

    for (const answer of answers) {

      const questionId =
        answer.questionId.toString();

      if (submittedQuestionIds.has(questionId)) {
        return res.status(400).json({
          success: false,
          message: "Duplicate answer submitted for a question"
        });
      }

      submittedQuestionIds.add(questionId);
    }

    // Get correct answers
    const questions = await Question.find({
      _id: {
        $in: attempt.questionIds
      }
    }).select("_id correctAnswer");

    // Make sure all questions still exist
    if (
      questions.length !==
      attempt.questionIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Some test questions are no longer available"
      });
    }

    // ================= CALCULATE SCORE =================

    let score = 0;

    for (const answer of answers) {

      const question = questions.find(
        question =>
          question._id.toString() ===
          answer.questionId.toString()
      );

      if (!question) {
        continue;
      }

      // Correct answer
      if (
        answer.selectedAnswer ===
        question.correctAnswer
      ) {
        score += Number(
          configuration.marksPerQuestion
        );
      }

      // Wrong answer
      else if (
        answer.selectedAnswer !== null &&
        answer.selectedAnswer !== undefined &&
        answer.selectedAnswer !== ""
      ) {

        // Negative marking only if company enabled it
        if (
          Number(configuration.negativeMarks) > 0
        ) {
          score -= Number(
            configuration.negativeMarks
          );
        }
      }

      // Unanswered = 0
    }

    // Score cannot go below zero
    score = Math.max(0, score);

    // ================= SAVE ATTEMPT =================

    attempt.answers = answers;
    attempt.score = score;
    attempt.status = "SUBMITTED";
    attempt.submittedAt = new Date();

    await attempt.save();

    // ================= CREATE ROUND RESULT =================

    const existingResult =
      await RoundResult.findOne({
        driveId: attempt.driveId,
        roundId: attempt.roundId,
        candidateId: candidate._id
      });

    if (existingResult) {
      return res.status(409).json({
        success: false,
        message: "Round result already exists"
      });
    }

    const roundResult =
      await RoundResult.create({
        driveId: attempt.driveId,
        roundId: attempt.roundId,
        candidateId: candidate._id,
        marks: score,
        status: "PENDING"
      });

    // ================= RESPONSE =================

    return res.status(200).json({
      success: true,
      message: "Test submitted successfully",

      result: {
        attemptId: attempt._id,
        roundResultId: roundResult._id,
        score,
        totalQuestions:
          attempt.questionIds.length,
        answeredQuestions:
          answers.length
      }
    });

  } catch (error) {
    console.error(
      "Submit test error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error while submitting test"
    });
  }
};


// ================= EXPORTS =================

module.exports = {
  startTest,
  submitTest
};