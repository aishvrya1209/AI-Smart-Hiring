
const mongoose = require("mongoose");
const TestConfiguration = require("../models/testConfiguration");
const PlacementDrive = require("../models/placementDrive");
const Round = require("../models/round");

const validateConfiguration = (data) => {
  const {
    totalQuestions,
    totalMarks,
    passingMarks,
    marksPerQuestion,
    topics
  } = data;

  if (
    !Array.isArray(topics) ||
    topics.length === 0
  ) {
    return "Please provide at least one topic";
  }

  const topicQuestionCount = topics.reduce(
    (sum, topic) => sum + Number(topic.questionCount || 0),
    0
  );

  if (topicQuestionCount !== Number(totalQuestions)) {
    return "Total topic questions must equal totalQuestions";
  }

  if (Number(passingMarks) > Number(totalMarks)) {
    return "Passing marks cannot exceed total marks";
  }

  if (
    Number(totalMarks) !==
    Number(totalQuestions) * Number(marksPerQuestion)
  ) {
    return "Total marks must equal total questions multiplied by marks per question";
  }

  return null;
};

// Verify company ownership and round relationship
const verifyDriveAndRound = async (
  driveId,
  roundId,
  companyId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(driveId) ||
    !mongoose.Types.ObjectId.isValid(roundId)
  ) {
    return { error: "Invalid driveId or roundId" };
  }

  const drive = await PlacementDrive.findOne({
    _id: driveId,
    companyId
  });

  if (!drive) {
    return { error: "Placement drive not found or unauthorized" };
  }

  const round = await Round.findOne({
    _id: roundId,
    driveId
  });

  if (!round) {
    return { error: "Round not found for this placement drive" };
  }

  return { drive, round };
};

// CREATE CONFIGURATION
const createConfiguration = async (req, res) => {
  try {
    const companyId = req.user.id;

    const {
      driveId,
      roundId,
      ...configurationData
    } = req.body;

    const verification = await verifyDriveAndRound(
      driveId,
      roundId,
      companyId
    );

    if (verification.error) {
      return res.status(400).json({
        success: false,
        message: verification.error
      });
    }

    const validationError =
      validateConfiguration(configurationData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const existingConfiguration =
      await TestConfiguration.findOne({ roundId });

    if (existingConfiguration) {
      return res.status(409).json({
        success: false,
        message: "Configuration already exists for this round"
      });
    }

    const configuration = await TestConfiguration.create({
      driveId,
      roundId,
      companyId,
      ...configurationData
    });

    return res.status(201).json({
      success: true,
      message: "Test configuration created successfully",
      configuration
    });
  } catch (error) {
    console.error("Create configuration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Configuration already exists for this round"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating configuration"
    });
  }
};

// GET CONFIGURATION BY ROUND
const getConfigurationByRound = async (req, res) => {
  try {
    const { roundId } = req.params;
    const companyId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(roundId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid round ID"
      });
    }

    const configuration = await TestConfiguration.findOne({
      roundId,
      companyId
    });

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: "Test configuration not found"
      });
    }

    return res.status(200).json({
      success: true,
      configuration
    });
  } catch (error) {
    console.error("Get configuration error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching configuration"
    });
  }
};

// UPDATE CONFIGURATION
const updateConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid configuration ID"
      });
    }

    const configuration = await TestConfiguration.findOne({
      _id: id,
      companyId
    });

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found"
      });
    }

    if (configuration.status === "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Active configuration cannot be edited"
      });
    }

    const allowedFields = [
      "title",
      "category",
      "durationMinutes",
      "totalQuestions",
      "totalMarks",
      "passingMarks",
      "difficulty",
      "topics",
      "marksPerQuestion",
      "negativeMarks",
      "randomizeQuestions",
      "randomizeOptions",
      "maxAttempts",
      "instructions"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const mergedData = {
      ...configuration.toObject(),
      ...updates
    };

    const validationError =
      validateConfiguration(mergedData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    Object.assign(configuration, updates);

    await configuration.save();

    return res.status(200).json({
      success: true,
      message: "Test configuration updated successfully",
      configuration
    });
  } catch (error) {
    console.error("Update configuration error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating configuration"
    });
  }
};

// DELETE CONFIGURATION
const deleteConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid configuration ID"
      });
    }

    const configuration = await TestConfiguration.findOne({
      _id: id,
      companyId
    });

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found"
      });
    }

    if (configuration.status === "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Active configuration cannot be deleted"
      });
    }

    await configuration.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Test configuration deleted successfully"
    });
  } catch (error) {
    console.error("Delete configuration error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting configuration"
    });
  }
};

module.exports = {
  createConfiguration,
  getConfigurationByRound,
  updateConfiguration,
  deleteConfiguration
};
