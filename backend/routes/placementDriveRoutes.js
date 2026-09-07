const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const companyAuthorization = require("../middleware/companyAuth");

const { createDrive, allDrives, showDrive, updateDrive, dropDrive} = require("../controller/placementDriveController");

router.post("/" , auth , companyAuthorization , createDrive);

router.get("/" , allDrives );

router.get("/:id" , showDrive);

router.put("/:id", auth , companyAuthorization , updateDrive);

router.delete("/:id" , auth , companyAuthorization , dropDrive);

module.exports = router;