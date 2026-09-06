const Company = require("../models/company");

const getPendingCompanies = async (req, res) => {
    try {
        const companies = await Company.find({
            verificationStatus: "pending",
            profileCompleted: true
        }).select("-password");

        res.status(200).json({
            count: companies.length,
            companies
        });

    } catch (error) {
        console.error("Get pending companies error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const approveCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        if (!company.profileCompleted) {
            return res.status(400).json({
                message: "Company profile is not completed"
            });
        }

        if (company.verificationStatus === "approved") {
            return res.status(400).json({
                message: "Company is already approved"
            });
        }

        company.verificationStatus = "approved";
        company.rejectionReason = null;
        company.verifiedAt = new Date();

        await company.save();

        res.status(200).json({
            message: "Company approved successfully",
            company: {
                id: company._id,
                companyId: company.companyId,
                companyName: company.companyName,
                email: company.email,
                verificationStatus: company.verificationStatus,
                verifiedAt: company.verifiedAt
            }
        });

    } catch (error) {
        console.error("Approve company error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const rejectCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        if (!company.profileCompleted) {
            return res.status(400).json({
                message: "Company profile is not completed"
            });
        }

        const { rejectionReason } = req.body;

        if (!rejectionReason || !rejectionReason.trim()) {
            return res.status(400).json({
                message: "Rejection reason is required"
            });
        }

        company.verificationStatus = "rejected";
        company.rejectionReason = rejectionReason.trim();
        company.verifiedAt = null;

        await company.save();

        res.status(200).json({
            message: "Company rejected successfully",
            company: {
                id: company._id,
                companyId: company.companyId,
                companyName: company.companyName,
                email: company.email,
                verificationStatus: company.verificationStatus,
                rejectionReason: company.rejectionReason
            }
        });

    } catch (error) {
        console.error("Reject company error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getPendingCompanies,
    approveCompany,
    rejectCompany
};

