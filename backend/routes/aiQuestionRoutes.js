const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const companyAuthorization = require("../middleware/companyAuth");


const {
  generateAIQuestions
} = require("../controller/aiQuestionController");

// Replace this import with your existing JWT middleware


router.post(
  "/generate",
  auth,
  companyAuthorization,
  generateAIQuestions
);

module.exports = router;