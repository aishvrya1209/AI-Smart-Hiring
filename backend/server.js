const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoute");
const candidateRoutes = require("./routes/candidateRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminRoutes = require("./routes/adminRoutes");
const companyAuthRoutes = require("./routes/companyAuthRoutes");
const companyProfileRoutes = require("./routes/companyProfileRoutes");
const placementDriveRoutes = require("./routes/placementDriveRoutes.js")

const connectDB = require("./db/db.js");



const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/company", companyAuthRoutes);

app.use("/api/company/profile", companyProfileRoutes);

app.use("/api/users", userRoutes);

app.use("/api/users/profile", candidateRoutes);

app.use("/api/admin/auth", adminAuthRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/company/drives" , placementDriveRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "AI Smart Hiring Backend is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});