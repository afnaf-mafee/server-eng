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
    const { studentId, className, name, phone } = req.query;

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
        $options: "i",
      };
    }

    if (phone) {
      filter.phone = {
        $regex: phone,
      };
    }

    const students = await Student.find(filter).sort({
      createdAt: -1,
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
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

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
// MAKE STUDENT ACTIVE
// =========================

const makeStudentActive = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndUpdate(
      id,
      {
        status: "Active",
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student activated successfully",
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
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

    const { amount, month } = req.body;

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
      (payment) => payment.month === month,
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
    const transactionId = crypto.randomInt(1000000, 10000000);

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
// invoice
const addInvoice = async (req, res) => {
  try {
    const { studentId, amount, feeType } = req.body;

    // Validation
    if (!studentId || !amount || !feeType) {
      return res.status(400).json({
        success: false,
        message: "Student ID, amount and fee type are required",
      });
    }

    // Find student
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Generate transaction id
    const transactionId = crypto.randomInt(1000000, 10000000);

    // Invoice object
    const invoiceData = {
      transactionId,
      amount: Number(amount),
      feeType,
      paidAt: new Date(),
    };

    // Save invoice
    student.invoices.push(invoiceData);

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Invoice created successfully",
      data: {
        transactionId,
        studentId: student.studentId,
        studentName: student.name,
        amount,
        feeType,
        paidAt: invoiceData.paidAt,
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
// =========================
// MARK / UPDATE ATTENDANCE
// =========================

const markAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    // frontend থেকে attendanceData আসবে
    const { date, status, note = "" } = req.body.attendanceData || req.body;

    // validation
    if (!date || !status) {
      return res.status(400).json({
        success: false,
        message: "Date and status are required",
      });
    }

    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status",
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // same date check

    const attendanceIndex = student.attendance.findIndex((item) => {
      const itemDate = new Date(item.date).toISOString().split("T")[0];

      return itemDate === date;
    });

    // update existing

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

    // create new

    const attendanceData = {
      date: new Date(`${date}T00:00:00+06:00`),

      status,

      note,
    };

    student.attendance.push(attendanceData);

    await student.save();

    return res.status(201).json({
      success: true,

      message: "Attendance marked successfully",

      data: attendanceData,
    });
  } catch (error) {
    console.error("Attendance Error:", error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
// =========================
// BULK MARK ATTENDANCE
// =========================

const bulkMarkAttendance = async (req, res) => {
  try {
    const { students, date, status, note = "" } = req.body;

    if (!students || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No students selected",
      });
    }

    for (const studentId of students) {
      const student = await Student.findById(studentId);

      if (!student) continue;

      const index = student.attendance.findIndex((item) => {
        return new Date(item.date).toISOString().split("T")[0] === date;
      });

      if (index !== -1) {
        student.attendance[index].status = status;

        student.attendance[index].note = note;
      } else {
        student.attendance.push({
          date: new Date(`${date}T00:00:00+06:00`),

          status,

          note,
        });
      }

      await student.save();
    }

    res.status(200).json({
      success: true,

      message: "Attendance saved for selected students",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// =========================
// ADD STUDENT RESULT
// =========================
const addResult = async (req, res) => {
  try {
    const { id } = req.params;

    const { examType, examNumber, obtainedMarks } = req.body;

    // Validation
    if (!examType || !examNumber || obtainedMarks === undefined) {
      return res.status(400).json({
        success: false,

        message: "All result fields are required",
      });
    }

    // Find Student
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,

        message: "Student not found",
      });
    }

    // Bangladesh Date

    const bangladeshDate = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka",
      }),
    );

    // Calculate Percentage

    const percentage = (Number(obtainedMarks) / Number(examNumber)) * 100;

    const resultData = {
      examType,

      examNumber: Number(examNumber),

      obtainedMarks: Number(obtainedMarks),

      percentage: Number(percentage.toFixed(2)),

      resultDate: bangladeshDate,
      isSent: false,

      sentAt: null,
      // Send Tracking

      isSent: false,

      sentAt: null,
    };

    // Push Result

    student.results.push(resultData);

    await student.save();

    return res.status(201).json({
      success: true,

      message: "Result added successfully",

      data: resultData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// =========================
// SEND ALL PENDING RESULTS
// =========================

const sendResultsToAll = async (req, res) => {
  try {
    const students = await Student.find({
      "results.isSent": false,
    });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,

        message: "No pending results found",
      });
    }

    const sentResults = [];

    for (const student of students) {
      const pendingResults = student.results.filter(
        (result) => result.isSent === false,
      );

      if (pendingResults.length > 0) {
        // এখানে Email/SMS API call হবে

        pendingResults.forEach((result) => {
          result.isSent = true;

          result.sentAt = new Date(
            new Date().toLocaleString("en-US", {
              timeZone: "Asia/Dhaka",
            }),
          );
        });

        await student.save();

        sentResults.push({
          student: student.name,

          results: pendingResults.length,
        });
      }
    }

    return res.status(200).json({
      success: true,

      message: "Results sent successfully",

      data: sentResults,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
// =========================
// GET STUDENT RESULTS
// =========================

const getStudentResults = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).select("name studentId results");

    if (!student) {
      return res.status(404).json({
        success: false,

        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,

      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// =========================
// UPDATE RESULT
// =========================

// const updateResult = async (req, res) => {
//   try {
//     const { id, resultId } = req.params;

//     const student = await Student.findById(id);

//     if (!student) {
//       return res.status(404).json({
//         success: false,

//         message: "Student not found",
//       });
//     }

//     const result = student.results.id(resultId);

//     if (!result) {
//       return res.status(404).json({
//         success: false,

//         message: "Result not found",
//       });
//     }

//     Object.assign(result, req.body);

//     await student.save();

//     res.status(200).json({
//       success: true,

//       message: "Result updated successfully",

//       data: result,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,

//       message: error.message,
//     });
//   }
// };

// =========================
// DELETE RESULT
// =========================

// const deleteResult = async (req, res) => {
//   try {
//     const { id, resultId } = req.params;

//     const student = await Student.findById(id);

//     if (!student) {
//       return res.status(404).json({
//         success: false,

//         message: "Student not found",
//       });
//     }

//     student.results.pull(resultId);

//     await student.save();

//     res.status(200).json({
//       success: true,

//       message: "Result deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,

//       message: error.message,
//     });
//   }
// };

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  addFeePayment,
  markAttendance,
  bulkMarkAttendance,
  addInvoice,
  addResult,
  sendResultsToAll,
  makeStudentActive
};
