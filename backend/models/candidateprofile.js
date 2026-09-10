const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    phone: {
      type: String
    },

    location: {
      type: String
    },
    profilePhoto: {
      type: String
    },

    education: {
      degree: {
        type: String
      },

      college: {
        type: String
      },

      branch: {
        type: String
      },

      graduationYear: {
        type: Number
      },

      cgpa: {
        type: Number
      }
    },

    skills: [
      {
        type: String
      }
    ],

    experience: {
      type: String,
      enum: ["Fresher", "Experienced"],
      default: "Fresher"
    },

    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
        githubLink: String,
        liveLink: String
      }
    ],

    resume: {
      type: String
    },

    github: {
      type: String
    },

    linkedin: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.CandidateProfile ||
  mongoose.model("CandidateProfile", candidateSchema);