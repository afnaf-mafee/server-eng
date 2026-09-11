const mongoose = require("mongoose");
const crypto = require("crypto");

const generateStudentId = () => {
  return crypto.randomInt(100000, 999999);
};

const feePaymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: Number,
      unique: true,
      default: () => Number(Math.floor(1000000 + Math.random() * 9000000)),
    },
    month: {
      type: String,
      required: true,
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
);

const invoiceSchema = new mongoose.Schema(
  {
    transactionId: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
);
const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  {
    _id: true,
  }
);


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
    attendance: {
        type: [attendanceSchema],
      default: [],
    },
    feePayments: {
      type: [feePaymentSchema],
      default: [],
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
    },
    admissionFee: {
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
    invoices: {
      type: [invoiceSchema],
      default: [],
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
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

  throw new Error("Unable to generate unique student ID");
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
