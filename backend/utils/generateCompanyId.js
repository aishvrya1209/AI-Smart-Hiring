const crypto = require("crypto");

const generateCompanyId = () => {
  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `CMP-${randomPart}`;
};

module.exports = generateCompanyId;