const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const companyAuthorization = require("../middleware/companyAuth");

const {
    createRound,
    getRoundsByDrive,
    getRound,
    updateRound,
    deleteRound
} = require("../controller/roundController");


// Create a round for a drive
router.post(
    "/:driveId/rounds",
    auth,
    companyAuthorization,
    createRound
);


// Get all rounds of a drive
router.get(
    "/:driveId/rounds",
    getRoundsByDrive
);


// Get a single round
router.get(
    "/round/:id",
    getRound
);


// Update a round
router.put(
    "/round/:id",
    auth,
    companyAuthorization,
    updateRound
);


// Delete a round
router.delete(
    "/round/:id",
    auth,
    companyAuthorization,
    deleteRound
);


module.exports = router;