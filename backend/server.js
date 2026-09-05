const express=require("express");
const cors=require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoute");


const connectDB=require("./db/db.js");
const app=express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.json({
    message: "AI Smart Hiring Backend is running"
  });
});
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});