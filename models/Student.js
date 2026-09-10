const mongoose = require("mongoose");
const crypto = require("crypto");


const generateStudentId = () => {
  return crypto.randomInt(100000, 999999);
};


const studentSchema = new mongoose.Schema(
  {

    studentId: {
      type: String,
      unique: true,
      index: true,
    },


    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },


    className: {
      type: String,
      required: true,
      trim: true,
    },


    monthlyFee: {
      type: Number,
      required: true,
      min: 0,
    }, admissionFee: {
      type: Number,
      required: true,
      min: 0,
    },


    section: {
      type: String,
      required: true,
      enum: ["A", "B", "C"],
    },


    guardian: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },


    phone: {
      type: String,
      required: true,
    
      index: true,
      match: /^01[3-9]\d{8}$/,
    },


    joinDate: {
      type: Date,
      default: Date.now,
    },

  },
  {
    timestamps: true,
  }
);



// Auto generate backend student ID
studentSchema.pre("save", async function () {

  if (this.studentId) {
    return;
  }


  const Student = mongoose.model("Student");


  const MAX_RETRY = 5;


  for (let i = 0; i < MAX_RETRY; i++) {


    const newId = generateStudentId();


    const exists = await Student.exists({
      studentId: newId,
    });


    if (!exists) {

      this.studentId = newId;

      return;

    }

  }


  throw new Error(
    "Unable to generate unique student ID"
  );


});



const Student = mongoose.model(
  "Student",
  studentSchema
);


module.exports = Student;