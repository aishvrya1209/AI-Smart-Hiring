const Company = require("../models/company");
const generateCompanyId = require("../utils/generateCompanyId");

// CREATE / COMPLETE PROFILE
const createCompanyProfile = async (req, res) => {
  try {
    const {
      companyName,
      website,
      linkedIn,
      areaOfWork,
      founder,
      foundingYear,
      description
    } = req.body;

    // Find logged-in company
    const company = await Company.findById(req.user.id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found"
      });
    }

       if (company.profileCompleted) {
      return res.status(400).json({
        message: "Company profile already completed"
      });
    }

    // Update profile
    company.companyName = companyName || company.companyName;
    company.website = website;
    company.linkedIn = linkedIn;
    company.areaOfWork = areaOfWork;
    company.founder = founder;
    company.foundingYear = foundingYear;
    company.description = description;

    // Generate company ID if it doesn't exist
    if (!company.companyId) {
      company.companyId = generateCompanyId();
    }

    company.profileCompleted = true;
    // Send for admin verification
    company.verificationStatus = "pending";
    company.rejectionReason = null;

    await company.save();

    res.status(200).json({
      message: "Company profile submitted for verification",
      company: {
        id: company._id,
        companyId: company.companyId,
        companyName: company.companyName,
        email: company.email,
        website: company.website,
        linkedIn: company.linkedIn,
        areaOfWork: company.areaOfWork,
        founder: company.founder,
        foundingYear: company.foundingYear,
        description: company.description,
        verificationStatus: company.verificationStatus,
        profileStatus:company.profileCompleted
      }
    });
  } catch (error) {
    console.error("Create company profile error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// GET PROFILE
const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.user.id).select("-password");

    if (!company) {
      return res.status(404).json({
        message: "Company not found"
      });
    }

    res.status(200).json({
      company
    });
  } catch (error) {
    console.error("Get company profile error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// UPDATE PROFILE
const updateCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.user.id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found"
      });
    }

    const {
      companyName,
      website,
      linkedIn,
      areaOfWork,
      founder,
      foundingYear,
      description
    } = req.body;

    if (companyName) company.companyName = companyName;
    if (website !== undefined) company.website = website;
    if (linkedIn !== undefined) company.linkedIn = linkedIn;
    if (areaOfWork !== undefined) company.areaOfWork = areaOfWork;
    if (founder !== undefined) company.founder = founder;
    if (foundingYear !== undefined) company.foundingYear = foundingYear;
    if (description !== undefined) company.description = description;

    // If rejected and company changes profile,
    // send it back to pending.
    if (company.verificationStatus === "rejected") {
      company.verificationStatus = "pending";
      company.rejectionReason = null;
    }

    await company.save();

    res.status(200).json({
      message: "Company profile updated",
      company: {
        id: company._id,
        companyId: company.companyId,
        companyName: company.companyName,
        email: company.email,
        website: company.website,
        linkedIn: company.linkedIn,
        areaOfWork: company.areaOfWork,
        founder: company.founder,
        foundingYear: company.foundingYear,
        description: company.description,
        verificationStatus: company.verificationStatus
      }
    });
  } catch (error) {
    console.error("Update company profile error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  createCompanyProfile,
  getCompanyProfile,
  updateCompanyProfile
};