const crypto = require("crypto");
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
// =========================
// ADD STUDENT FEE PAYMENT
// =========================
const addFeePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      amount,
      month,
    } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!amount || !month) {
      return res.status(400).json({
        success: false,
        message: "Amount and month are required",
      });
    }

    // =========================
    // FIND STUDENT
    // =========================
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // =========================
    // CHECK DUPLICATE MONTH
    // =========================
    const alreadyPaid = student.feePayments.find(
      (payment) => payment.month === month
    );

    if (alreadyPaid) {
      return res.status(409).json({
        success: false,
        message: `${month} month's fee has already been paid.`,
        data: {
          transactionId: alreadyPaid.transactionId,
          month: alreadyPaid.month,
          amount: alreadyPaid.amount,
          paidAt: alreadyPaid.paidAt,
        },
      });
    }
const transactionId = crypto.randomInt(
      1000000,
      10000000
    );
   
    // =========================
    // PAYMENT DATA
    // =========================
    const paymentData = {
      transactionId,
      amount: Number(amount),
      month,
      paidAt: new Date(),
    };

    // =========================
    // ADD TO FEE PAYMENTS
    // =========================
    student.feePayments.push(paymentData);

    // =========================
    // ADD TO INVOICES
    // =========================
    student.invoices.push({
      transactionId,
      amount: Number(amount),
     
      paidAt: new Date(),
    });

    // =========================
    // SAVE STUDENT
    // =========================
    await student.save();

    // =========================
    // RESPONSE
    // =========================
    return res.status(200).json({
      success: true,
      message: `${month} month's fee paid successfully.`,
      data: {
        transactionId,
        studentId: student.studentId,
        studentName: student.name,
        amount: Number(amount),
        month,
        paidAt: paymentData.paidAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =========================
// MARK / UPDATE ATTENDANCE
// =========================
const markAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      date,
      status,
      note = "",
    } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!date || !status) {
      return res.status(400).json({
        success: false,
        message: "Date and status are required",
      });
    }

    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Present or Absent",
      });
    }

    // =========================
    // FIND STUDENT
    // =========================
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // =========================
    // CHECK SAME DATE
    // =========================
    const attendanceIndex = student.attendance.findIndex(
      (item) => {
        const itemDate = new Date(item.date)
          .toISOString()
          .split("T")[0];

        return itemDate === date;
      }
    );

    // =========================
    // UPDATE EXISTING ATTENDANCE
    // =========================
    if (attendanceIndex !== -1) {
      student.attendance[attendanceIndex].status = status;
      student.attendance[attendanceIndex].note = note;

      await student.save();

      return res.status(200).json({
        success: true,
        message: "Attendance updated successfully",
        data: student.attendance[attendanceIndex],
      });
    }

    // =========================
    // CREATE NEW ATTENDANCE
    // =========================
    const attendanceData = {
      date: new Date(`${date}T00:00:00+06:00`),
      status,
      note,
    };

    student.attendance.push(attendanceData);

    await student.save();

    // =========================
    // RESPONSE
    // =========================
    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: {
        studentId: student.studentId,
        studentName: student.name,
        attendance: attendanceData,
      },
    });
  } catch (error) {
    console.error("Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// add feePayment

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  addFeePayment,
  markAttendance 
};