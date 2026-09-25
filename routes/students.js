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
  bulkMarkAttendance
} = require("../controllers/studentController");

// =========================
// CREATE STUDENT
// POST /students
// =========================
router.post("/", createStudent);

// =========================
// GET ALL STUDENTS
// GET /students
// =========================
router.get("/", getStudents);

// =========================
// ADD FEE PAYMENT
// POST /students/:id/fee-payment
// =========================
router.post("/:id/fee-payment", addFeePayment);

// =========================
// MARK / UPDATE ATTENDANCE
// PATCH /students/:id/attendance
// =========================
router.patch("/:id/attendance", markAttendance);

// =========================
// GET SINGLE STUDENT
// GET /students/:id
// =========================
router.get("/:id", getStudentById);

// =========================
// UPDATE STUDENT
// PUT /students/:id
// =========================
router.put("/:id", updateStudent);

// =========================
// DELETE STUDENT
// DELETE /students/:id
// =========================
router.delete("/:id", deleteStudent);
router.patch(
 "/bulk-attendance",
 bulkMarkAttendance
);

module.exports = router;
