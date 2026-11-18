const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  startTest,
  submitTest
} = require("../controller/testAttemptController");

// Candidate starts a test
router.post(
  "/start",
  auth,
  startTest,
);

router.post(
  "/submit",
  auth,
  submitTest,
);

module.exports = router;