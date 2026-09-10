const Student = require("../models/Student");

// =========================
// CREATE STUDENT - POST
// =========================
const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// GET ALL STUDENTS - GET
// =========================
const getStudents = async (req, res) => {
  try {

    const {
      studentId,
      className,
      name,
      phone
    } = req.query;


    const filter = {};


    if (studentId) {
      filter.studentId = studentId;
    }


    if (className && className !== "all") {
      filter.className = className;
    }


    if (name) {
      filter.name = {
        $regex: name,
        $options: "i"
      };
    }


    if (phone) {
      filter.phone = {
        $regex: phone
      };
    }


    const students = await Student
      .find(filter)
      .sort({
        createdAt: -1
      });


    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });


  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// =========================
// GET SINGLE STUDENT - GET
// =========================
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    console.log(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// UPDATE STUDENT - PUT
// =========================
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// DELETE STUDENT - DELETE
// =========================
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};