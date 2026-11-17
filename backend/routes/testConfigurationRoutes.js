
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const companyAuthorization = require("../middleware/companyAuth");

const {
  createConfiguration,
  getConfigurationByRound,
  updateConfiguration,
  deleteConfiguration
} = require("../controller/testConfigurationController");

// All routes require company authentication
router.use(auth, companyAuthorization);

// Create configuration
router.post("/", createConfiguration);

// Get configuration for a round
router.get("/round/:roundId", getConfigurationByRound);

// Update configuration
router.put("/:id", updateConfiguration);

// Delete configuration
router.delete("/:id", deleteConfiguration);

module.exports = router;
