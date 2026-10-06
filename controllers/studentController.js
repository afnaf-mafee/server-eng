const crypto = require("crypto");
const Student = require("../models/Student");
const sendSMS = require("../services/smsService");
// =========================
// CREATE STUDENT - POST
// =========================

const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);

    // Send SMS after student create
    if (student.phone) {
      const message = `
Dear ${student.name},
Welcome to ELC! Your registration has been completed successfully.

Your ID: ${student.studentId}
Please keep this ID for future reference.

Thank you.
`;
      const smsNumber = `88${student.phone}`;

      await sendSMS(smsNumber, message);
    }

    res.status(201).json({
      success: true,
      message: "Student created successfully and SMS sent",
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
    // SEND SMS AFTER PAYMENT
    // =========================
    if (student.phone) {
      const message = `
Dear ${student.name},
Your fee payment has been received successfully.

Student ID: ${student.studentId}
Payment Month: ${month}
Paid Amount: ${Number(amount)} Taka
Transaction ID: ${transactionId}
Payment Date: ${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}

Thank you for your payment.

      `;

      const smsNumber = `88${student.phone}`;

      await sendSMS(smsNumber, message);
    }

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

    // =========================
    // SEND SMS AFTER INVOICE
    // =========================
    if (student.phone) {
      const message = `
Dear ${student.name},
Your ${feeType} payment has been received successfully.

Student ID: ${student.studentId}
Paid Amount: ${Number(amount)} Taka
Transaction ID: ${transactionId}
Payment Date: ${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}

Thank you for your payment.
ELC
`;

      const smsNumber = `88${student.phone}`;

      await sendSMS(smsNumber, message);
    }

    return res.status(200).json({
      success: true,
      message: "Invoice created successfully",
      data: {
        transactionId,
        studentId: student.studentId,
        studentName: student.name,
        amount: Number(amount),
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

    const absentStudents = [];

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

      // Store absent students for SMS
      if (status === "Absent" && student.phone) {
        absentStudents.push(student);
      }
    }

    // =========================
    // SEND ABSENT SMS
    // =========================

    for (const student of absentStudents) {
      const formattedDate = new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
      });

      const message = `
Dear Guardian,

Your child ${student.name} (Class ${student.className}) is marked absent at ELC on ${formattedDate}.

Please reply with the reason for absence.

Thank you,
ELC Office.
`;

      const smsNumber = `88${student.phone}`;

      await sendSMS(smsNumber, message);
    }

    return res.status(200).json({
      success: true,
      message: "Attendance saved and absent SMS sent successfully",
      smsSent: absentStudents.length,
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
        // Latest result
        const result = pendingResults[pendingResults.length - 1];

        const message = `
Dear Guardian,

Your child ${student.name} (Class ${student.className}) result has been published at ELC.

Exam: ${result.examType}
Marks: ${result.obtainedMarks}

Thank you,
ELC Office.
`;

        if (student.phone) {
          const smsNumber = `88${student.phone}`;

          await sendSMS(smsNumber, message);
        }

        // update tracking
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
          phone: student.phone,
          results: pendingResults.length,
        });
      }
    }

    return res.status(200).json({
      success: true,

      message: "All results sent successfully",

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
const getResultRanking = async (req, res) => {
  try {
    const students = await Student.find();

    let ranking = [];

    students.forEach((student) => {
      student.results.forEach((result) => {
        ranking.push({
          name: student.name,

          studentId: student.studentId,

          className: student.className,

          examType: result.examType,

          examNumber: result.examNumber,

          obtainedMarks: result.obtainedMarks,
        });
      });
    });

    ranking.sort((a, b) => b.obtainedMarks - a.obtainedMarks);

    ranking = ranking.map((item, index) => ({
      ...item,

      rank: index + 1,
    }));

    res.json({
      success: true,

      data: ranking,
    });
  } catch (error) {
    res.status(500).json({
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
  makeStudentActive,
};
