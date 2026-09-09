const express = require("express");

const {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus
} = require("../controller/applicationcntrl");

const authMiddleware = require("../middleware/auth");

const router = express.Router();


// Candidate applies for a job
router.post(
  "/:jobId",
  authMiddleware,
  applyForJob
);


// Candidate sees own applications
router.get(
  "/my",
  authMiddleware,
  getMyApplications
);


// Company sees applicants for a job
router.get(
  "/job/:jobId",
  authMiddleware,
  getJobApplicants
);


// Company updates application status
router.put(
  "/:applicationId/status",
  authMiddleware,
  updateApplicationStatus
);


module.exports = router;