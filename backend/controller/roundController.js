const Round = require("../models/round");
const PlacementDrive = require("../models/placementDrive");


// Create a new round
const createRound = async (req, res) => {
    try {
        const { driveId } = req.params;

        const drive = await PlacementDrive.findById(driveId);

        if (!drive) {
            return res.status(404).send("No such Drive");
        }

        if (drive.companyId.toString() !== req.user.id) {
            return res.status(403).send("Not authorized to add a round to this drive");
        }

        const round = new Round({
            ...req.body,
            driveId: driveId
        });

        await round.save();

        res.status(201).send(round);

    } catch (err) {
        res.status(500).send(err);
    }
};


// Get all rounds for a drive
const getRoundsByDrive = async (req, res) => {
    try {
        const { driveId } = req.params;

        const drive = await PlacementDrive.findById(driveId);

        if (!drive) {
            return res.status(404).send("No such Drive");
        }

        const rounds = await Round.find({ driveId }).sort({ sequence: 1 });

        res.status(200).send(rounds);

    } catch (err) {
        res.status(500).send(err);
    }
};


// Get a single round
const getRound = async (req, res) => {
    try {
        const { id } = req.params;

        const round = await Round.findById(id);

        if (!round) {
            return res.status(404).send("No such Round");
        }

        res.status(200).send(round);

    } catch (err) {
        res.status(500).send(err);
    }
};


// Update a round
const updateRound = async (req, res) => {
    try {
        const { id } = req.params;

        const round = await Round.findById(id);

        if (!round) {
            return res.status(404).send("No such Round");
        }

        const drive = await PlacementDrive.findById(round.driveId);

        if (!drive) {
            return res.status(404).send("Associated Drive not found");
        }

        if (drive.companyId.toString() !== req.user.id) {
            return res.status(403).send("Not authorized to modify this round");
        }

        round.name = req.body.name;
        round.type = req.body.type;
        round.sequence = req.body.sequence;
        round.shortlistType = req.body.shortlistType;
        round.shortlistValue = req.body.shortlistValue;

        await round.save();

        res.status(200).send(round);

    } catch (err) {
        res.status(500).send(err);
    }
};


// Delete a round
const deleteRound = async (req, res) => {
    try {
        const { id } = req.params;

        const round = await Round.findById(id);

        if (!round) {
            return res.status(404).send("No such Round");
        }

        const drive = await PlacementDrive.findById(round.driveId);

        if (!drive) {
            return res.status(404).send("Associated Drive not found");
        }

        if (drive.companyId.toString() !== req.user.id) {
            return res.status(403).send("Not authorized to delete this round");
        }

        await Round.findByIdAndDelete(id);

        res.status(200).send("Round deleted successfully");

    } catch (err) {
        res.status(500).send(err);
    }
};


module.exports = {
    createRound,
    getRoundsByDrive,
    getRound,
    updateRound,
    deleteRound
};