const Application = require("../models/Application");
const Candidate = require("../models/CandidateProfile");
const Job = require("../models/placementDrive");

// ==========================================
// 1. Candidate Apply for Job
// ==========================================
const applyForJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    // Find candidate profile
    const candidate = await Candidate.findOne({ userId });

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found"
      });
    }

    // Check whether job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    // Check duplicate application
    const existingApplication = await Application.findOne({
      candidateId: candidate._id,
      jobId: jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job"
      });
    }

    // Create application
    const application = await Application.create({
      candidateId: candidate._id,
      jobId: jobId,
      resume: req.body.resume,
      coverLetter: req.body.coverLetter
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to apply for job",
      error: error.message
    });
  }
};


// ==========================================
// 2. Candidate - Get My Applications
// ==========================================
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find candidate
    const candidate = await Candidate.findOne({ userId });

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found"
      });
    }

    const applications = await Application.find({
      candidateId: candidate._id
    })
      .populate("jobId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: applications.length,
      applications
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to get applications",
      error: error.message
    });
  }
};


// ==========================================
// 3. Company - Get Applicants for a Job
// ==========================================
const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    const applications = await Application.find({
      jobId: jobId
    })
      .populate({
        path: "candidateId",
        populate: { path: "userId", select: "name email" }
      })
      .populate("jobId", "title companyId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: applications.length,
      applications
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to get applicants",
      error: error.message
    });
  }
};


// ==========================================
// 4. Update Application Status
// ==========================================
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const allowedStatus = [
      "Applied",
      "Shortlisted",
      "Rejected",
      "Selected",
      "Withdrawn"
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status"
      });
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      {
        $set: { status }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    res.status(200).json({
      message: "Application status updated successfully",
      application
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update application status",
      error: error.message
    });
  }
};


module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus
};