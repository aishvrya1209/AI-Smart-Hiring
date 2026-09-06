const express = require("express");

const {
  createCandidateProfile,
  getCandidateProfile,
  updateCandidateProfile
} = require("../controller/candidatecntrl");

const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createCandidateProfile
);

router.get(
  "/",
  authMiddleware,
  getCandidateProfile
);

router.put(
  "/",
  authMiddleware,
  updateCandidateProfile
);

module.exports = router;