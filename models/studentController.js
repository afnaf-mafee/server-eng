const Student = require("../models/Student");
const dayjs = require("dayjs");


// Create Student
const createStudent = async (req, res) => {
  try {

    let {
      name,
      className,
      monthlyFee,
      admissionFee,
      section,
      guardian,
      phone
    } = req.body;


    // Normalize
    name = name?.trim();
    className = className?.trim();
    guardian = guardian?.trim();
    phone = phone?.trim();


    // Validation
    if (
      !name ||
      !className || !admissionFee ||
      monthlyFee === undefined ||
      !section ||
      !guardian ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }


    // Phone validation
    const phoneRegex = /^01[3-9]\d{8}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bangladesh phone number"
      });
    }


    // Duplicate phone check
    const existingStudent = await Student.findOne({
      phone
    });


    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Student with this phone number already exists"
      });
    }


    // Create student
    // studentId will generate from backend model
    const student = await Student.create({

      name,
admissionFee,
      className,

      monthlyFee: Number(monthlyFee),

      section,

      guardian,

      phone,

      joinDate: dayjs().toDate()

    });


    return res.status(201).json({

      success: true,

      message: "Student created successfully",

      data: student

    });


  } catch (error) {

    console.error("Create Student Error:", error);


    if (error.code === 11000) {

      return res.status(409).json({
        success: false,
        message: "Duplicate student data found"
      });

    }


    return res.status(500).json({

      success: false,

      message: "Internal server error",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined

    });

  }
};

module.exports = {
  createStudent,
 
};