const Candidate = require("../models/candidateprofile");

// Create candidate profile
const createCandidateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if profile already exists
    const existingProfile = await Candidate.findOne({ userId });

    if (existingProfile) {
      return res.status(400).json({
        message: "Candidate profile already exists"
      });
    }

    const candidate = await Candidate.create({
      userId,
      ...req.body
    });

    res.status(201).json({
      message: "Candidate profile created successfully",
      candidate
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create candidate profile",
      error: error.message
    });
  }
};


// Get candidate profile
const getCandidateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const candidate = await Candidate.findOne({ userId })
      .populate("userId", "name email");

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found"
      });
    }

    res.status(200).json({
      candidate
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to get candidate profile",
      error: error.message
    });
  }
};


// Update candidate profile
const updateCandidateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const candidate = await Candidate.findOneAndUpdate(
      { userId },
      { $set: req.body },
      {
        new: true,
        runValidators: true
      }
    );

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found"
      });
    }

    res.status(200).json({
      message: "Candidate profile updated successfully",
      candidate
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update candidate profile",
      error: error.message
    });
  }
};


module.exports = {
  createCandidateProfile,
  getCandidateProfile,
  updateCandidateProfile
};