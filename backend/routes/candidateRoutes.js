const express = require("express");

const {
  createCandidateProfile,
  getCandidateProfile,
  updateCandidateProfile
} = require("../controller/candidatecntrl");

const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post(
  "/profile",
  authMiddleware,
  createCandidateProfile
);

router.get(
  "/profile",
  authMiddleware,
  getCandidateProfile
);

router.put(
  "/profile",
  authMiddleware,
  updateCandidateProfile
);

module.exports = router;