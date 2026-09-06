const express = require("express");

const {
    getPendingCompanies,
    approveCompany,
    rejectCompany
} = require("../controller/adminController");

const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.get(
    "/companies/pending",
    auth,
    adminAuth,
    getPendingCompanies
);
router.patch(
    "/companies/:id/approve",
    auth,
    adminAuth,
    approveCompany
);

router.patch(
    "/companies/:id/reject",
    auth,
    adminAuth,
    rejectCompany
);
module.exports = router;