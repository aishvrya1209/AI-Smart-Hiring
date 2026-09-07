const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    // Authentication fields
    companyName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String
    },

    phone:{
        type: String,
        required: true
    },

    // Company profile fields
    website: {
      type: String,
      trim: true
    },

    linkedIn: {
      type: String,
      trim: true
    },

    areaOfWork: {
      type: String,
      trim: true
    },

    founder: {
      type: String,
      trim: true
    },

    foundingYear: {
      type: Number
    },

    description: {
      type: String,
      trim: true
    },

    // Public/business reference ID
    companyId: {
      type: String,
      unique: true,
      sparse: true
    },

    profileCompleted: {
      type: Boolean,
      default: false
    },

    // Admin verification
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    rejectionReason: {
      type: String,
      default: null
    },

    verifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Company", companySchema);