
const mongoose = require("mongoose");

const PlacementDrive = require("../models/placementDrive");
const Round = require("../models/round");
const RoundResult = require("../models/roundResult");

// ============== EVALUATE ROUND & SHORTLIST CANDIDATES ==============

const evaluateRound = async (req, res) => {
  try {
    const { driveId, roundId } = req.body;
    const companyId = req.user.id;

    // 1. Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(driveId) ||
      !mongoose.Types.ObjectId.isValid(roundId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid driveId or roundId"
      });
    }

    // 2. Verify company owns the drive
    const drive = await PlacementDrive.findOne({
      _id: driveId,
      companyId
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found or unauthorized"
      });
    }

    // 3. Find round belonging to this drive
    const round = await Round.findOne({
      _id: roundId,
      driveId
    });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Round not found"
      });
    }

    // 4. Validate selection criteria
    if (
      round.shortlistType === "TOP_N" &&
      (!Number.isInteger(round.shortlistValue) ||
        round.shortlistValue <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "TOP_N shortlistValue must be a positive integer"
      });
    }

    if (
      round.shortlistType === "THRESHOLD" &&
      round.shortlistValue < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid marks threshold"
      });
    }

    // 5. Fetch all submitted candidate results
    const results = await RoundResult.find({
      driveId,
      roundId
    }).sort({
      marks: -1,
      createdAt: 1,
      _id: 1
    });

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No candidate results found for this round"
      });
    }

    // 6. Decide shortlisted candidates
    let selectedResults = [];

    if (round.shortlistType === "TOP_N") {
      selectedResults = results.slice(
        0,
        round.shortlistValue
      );
    }

    else if (round.shortlistType === "THRESHOLD") {
      selectedResults = results.filter(
        result => result.marks >= round.shortlistValue
      );
    }

    // 7. Store selected candidate IDs
    const selectedIds = new Set(
      selectedResults.map(result => result._id.toString())
    );

    // 8. Update candidate results
    const operations = results.map(result => ({
      updateOne: {
        filter: { _id: result._id },
        update: {
          $set: {
            status: selectedIds.has(result._id.toString())
              ? "SHORTLISTED"
              : "REJECTED"
          }
        }
      }
    }));

    await RoundResult.bulkWrite(operations);

    // 9. Response
    return res.status(200).json({
      success: true,
      message: "Round evaluation completed successfully",

      round: {
        roundId: round._id,
        roundName: round.name,
        shortlistType: round.shortlistType,
        shortlistValue: round.shortlistValue
      },

      totalCandidates: results.length,
      selectedCount: selectedResults.length,
      rejectedCount: results.length - selectedResults.length,

      selectedCandidates: results
        .filter(result => selectedIds.has(result._id.toString()))
        .map(result => ({
          candidateId: result.candidateId,
          marks: result.marks,
          status: "SHORTLISTED"
        })),

      rejectedCandidates: results
        .filter(result => !selectedIds.has(result._id.toString()))
        .map(result => ({
          candidateId: result.candidateId,
          marks: result.marks,
          status: "REJECTED"
        }))
    });

  } catch (error) {
    console.error("Round evaluation error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during round evaluation"
    });
  }
};

module.exports = {
  evaluateRound
};
