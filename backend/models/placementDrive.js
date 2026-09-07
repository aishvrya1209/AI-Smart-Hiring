const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const driveschema = new Schema({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    jobRole: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    empType: {
        type: String,
        enum: ["Internship", "Full-Time"],
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    eligibility: {
        type: String,
        required: true
    },
    appStart: {
        type: Date,
        required: true
    },
    appEnd: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["live", "draft", "closed"],
        default: "draft"
    },

},
    {
        timestamps: true
    });


module.exports = mongoose.model("placementDrive", driveschema);
