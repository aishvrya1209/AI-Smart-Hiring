const express = require("express");

const {
  createCompanyProfile,
  getCompanyProfile,
  updateCompanyProfile
} = require("../controller/companyProfileController");

const auth = require("../middleware/auth");
const companyAuth = require("../middleware/companyAuth");

const router = express.Router();

router.post(
  "/",
  auth,
  companyAuth,
  createCompanyProfile
);

router.get(
  "/",
  auth,
  companyAuth,
  getCompanyProfile
);

router.put(
  "/",
  auth,
  companyAuth,
  updateCompanyProfile
);

module.exports = router;