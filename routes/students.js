const express = require("express");

const router = express.Router();

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  addFeePayment,
    markAttendance,
} = require("../controllers/studentController");


// Create Student
router.post("/", createStudent);

// Get All Students
router.get("/", getStudents);

// Get Single Student
router.get("/:id", getStudentById);

// Update Student
router.put("/:id", updateStudent);
// Add fee payment
router.post("/:id/fee-payment", addFeePayment);
// Delete Student
router.delete("/:id", deleteStudent);
router.patch("/:id/attendance", markAttendance);



module.exports = router;