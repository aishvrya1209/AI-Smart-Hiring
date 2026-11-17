
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const companyAuthorization = require("../middleware/companyAuth");

const {
  getQuestionsByRound,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  rejectQuestion
} = require("../controller/questionController");

// All question management routes require company authentication
router.use(auth, companyAuthorization);

// Get all questions belonging to a round
router.get("/round/:roundId", getQuestionsByRound);

// Get one question
router.get("/:id", getQuestionById);

// Update a draft question
router.put("/:id", updateQuestion);

// Delete a draft question
router.delete("/:id", deleteQuestion);

// Approve a question
router.patch("/:id/approve", approveQuestion);

// Reject a question
router.patch("/:id/reject", rejectQuestion);

module.exports = router;
