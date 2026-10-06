const express = require("express");

const router = express.Router();

const { login, createAdmin } = require("../controllers/authController");

// Create Admin (first time)
router.post("/create-admin", createAdmin);

// Login
router.post("/login", login);

module.exports = router;
