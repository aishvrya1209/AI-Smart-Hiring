
const mongoose = require("mongoose");
const Question = require("../models/question");

// Helper: get company-owned question
const findCompanyQuestion = async (questionId, companyId) => {
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return null;
  }

  return Question.findOne({
    _id: questionId,
    companyId
  });
};

// 1. GET ALL QUESTIONS BY ROUND
const getQuestionsByRound = async (req, res) => {
  try {
    const { roundId } = req.params;
    const companyId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(roundId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid round ID"
      });
    }

    const questions = await Question.find({
      roundId,
      companyId
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalQuestions: questions.length,
      questions
    });

  } catch (error) {
    console.error("Get Questions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch questions"
    });
  }
};

// 2. GET SINGLE QUESTION
const getQuestionById = async (req, res) => {
  try {
    const companyId = req.user.id;

    const question = await findCompanyQuestion(
      req.params.id,
      companyId
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    return res.status(200).json({
      success: true,
      question
    });

  } catch (error) {
    console.error("Get Single Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch question"
    });
  }
};

// 3. UPDATE DRAFT QUESTION
const updateQuestion = async (req, res) => {
  try {
    const companyId = req.user.id;

    const question = await findCompanyQuestion(
      req.params.id,
      companyId
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    if (question.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft questions can be edited"
      });
    }

    const allowedFields = [
      "questionText",
      "topic",
      "difficulty",
      "category",
      "options",
      "correctAnswer",
      "explanation",
      "marks",
      "negativeMarks"
    ];

    // Only update permitted fields
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        question[field] = req.body[field];
      }
    }

    // Validate MCQ options
    if (
      !Array.isArray(question.options) ||
      question.options.length !== 4
    ) {
      return res.status(400).json({
        success: false,
        message: "An MCQ must have exactly four options"
      });
    }

    const validOptions = question.options.every(
      option =>
        typeof option.text === "string" &&
        option.text.trim().length > 0 &&
        typeof option.isCorrect === "boolean"
    );

    const correctOptions = question.options.filter(
      option => option.isCorrect === true
    );

    if (!validOptions || correctOptions.length !== 1) {
      return res.status(400).json({
        success: false,
        message: "Exactly one valid option must be correct"
      });
    }

    // Keep correctAnswer consistent with options
    if (
      question.correctAnswer !==
      correctOptions[0].text
    ) {
      return res.status(400).json({
        success: false,
        message: "Correct answer must match the correct option"
      });
    }

    await question.save();

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question
    });

  } catch (error) {
    console.error("Update Question Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update question"
    });
  }
};

// 4. DELETE DRAFT QUESTION
const deleteQuestion = async (req, res) => {
  try {
    const companyId = req.user.id;

    const question = await findCompanyQuestion(
      req.params.id,
      companyId
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    if (question.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft questions can be deleted"
      });
    }

    await Question.deleteOne({
      _id: question._id,
      companyId
    });

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully"
    });

  } catch (error) {
    console.error("Delete Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete question"
    });
  }
};

// 5. APPROVE QUESTION
const approveQuestion = async (req, res) => {
  try {
    const companyId = req.user.id;

    const question = await findCompanyQuestion(
      req.params.id,
      companyId
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    if (question.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft questions can be approved"
      });
    }

    question.status = "APPROVED";

    await question.save();

    return res.status(200).json({
      success: true,
      message: "Question approved successfully",
      question
    });

  } catch (error) {
    console.error("Approve Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve question"
    });
  }
};

// 6. REJECT QUESTION
const rejectQuestion = async (req, res) => {
  try {
    const companyId = req.user.id;

    const question = await findCompanyQuestion(
      req.params.id,
      companyId
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    if (question.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft questions can be rejected"
      });
    }

    question.status = "REJECTED";

    await question.save();

    return res.status(200).json({
      success: true,
      message: "Question rejected successfully",
      question
    });

  } catch (error) {
    console.error("Reject Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject question"
    });
  }
};

module.exports = {
  getQuestionsByRound,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  rejectQuestion
};
