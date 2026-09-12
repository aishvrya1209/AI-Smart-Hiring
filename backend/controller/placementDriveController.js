const PlacementDrive = require("../models/placementDrive");
const Company = require("../models/company");


//Create a new drive 
const createDrive = async (req, res) => {
    try {

        const company = await Company.findById(req.user.id);

        if (!company) {
            return res.status(404).send("Company not found.");
        }

        if (company.verificationStatus !== "approved") {
            return res.status(403).send(
                "Your company is not verified yet. You can create drives once an admin approves your account."
            );
        }

        if (new Date(req.body.appEnd) <= new Date(req.body.appStart)) {
            return res.status(400).send("Application end date must be after start date.");
        }

        const drive = new PlacementDrive({ ...req.body, companyId: req.user.id });

        await drive.save();

        res.status(201).send("Drive created successfully.")

    } catch (err) {
        res.status(500).send(err);
    }
};


// All Drives 
const allDrives = async (req, res) => {
    try {
        const drives = await PlacementDrive.find();
        res.status(200).send(drives);
    } catch (err) {
        res.status(500).send(err);
    };
};



//Single drive by Id 
const showDrive = async (req, res) => {

    try {
        const id = req.params.id;
        const drive = await PlacementDrive.findById(id);
        if (!drive) {
            // throw new ExpressError(404, "Listing Not Found");
            res.status(404).send("Drive is not available for the specified ID");
        }
        else {
            res.status(200).send(drive);
        }
    } catch (err) {
        res.status(500).send(err);
    };
};




//Update a Drive 
const updateDrive = async (req, res) => {
    try {
        const id = req.params.id;
        const drive = await PlacementDrive.findById(id);

        if (!drive) {
            return res.status(404).send("No such Drive");
        }

        if (drive.companyId.toString() !== req.user.id) {
            return res.status(403).send("Not authorized to modify this drive");
        }

        Object.assign(drive, req.body);
        await drive.save();
        res.status(200).send(drive);

    } catch (err) {
        res.status(500).send(err);
    }
};


//Delete a drive
const dropDrive = async (req, res) => {

    try {
        const { id } = req.params;
        const drive = await PlacementDrive.findById(id);

        if (!drive) {
            return res.status(404).send("No such Drive");
        }

        if (drive.companyId.toString() !== req.user.id) {
            return res.status(403).send("Not authorized to modify this drive");
        }

        await PlacementDrive.findByIdAndDelete(id);
        res.send("Drive deleted successfully");
    } catch (err) {
        res.status(500).send(err);
    }
};



module.exports = { createDrive, allDrives, showDrive, updateDrive, dropDrive };
