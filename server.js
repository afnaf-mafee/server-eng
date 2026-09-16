const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const studentRoutes = require("./routes/students");
const batchRoutes= require("./routes/batchRoute");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/batch", batchRoutes);

// Test
app.get("/", (req, res) => {
  res.send("Student Management API is running");
});

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });