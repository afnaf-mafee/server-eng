const mongoose = require("mongoose");

// =========================
// FEE PAYMENT SCHEMA
// =========================
const getBangladeshDate = () => {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
    }),
  );
};
const feePaymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },

    transactionId: {
      type: Number,
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
// =========================
// RESULT SCHEMA
// =========================

const resultSchema = new mongoose.Schema(
  {
    examType: {
      type: String,
      required: true,
      enum: [
        "Item Test",
        "Weekly Test",
        "Monthly Test",
        "Model Test",
        "Grammar Test",
        "Quiz",
        "Final Exam",
      ],
    },

    examNumber: {
      type: Number,
      required: true,
      min: 0,
    },

    obtainedMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    // Result Send Tracking

    isSent: {
      type: Boolean,
      default: false,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    resultDate: {
      type: Date,
      required: true,
      default: getBangladeshDate,
    },
  },
  {
    _id: true,
  },
);
// =========================
// INVOICE SCHEMA
// =========================

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

    feeType: {
      type: String,
      default: "Monthly Fee",
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

// =========================
// ATTENDANCE SCHEMA
// =========================

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
  },
);

// =========================
// STUDENT SCHEMA
// =========================

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
    results: {
      type: [resultSchema],
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
    status: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
      required: true,
      enum: ["1", "2"],
    },

    time: {
      type: String,
      required: true,
    },

    school: {
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

// =========================
// AUTO GENERATE STUDENT ID
// =========================
//
// One   -> A101, A102, A103...
// Two   -> B101, B102, B103...
// Three -> C101, C102, C103...
// Four  -> D101, D102, D103...
// Five  -> E101, E102, E103...
// Six   -> F101, F102, F103...
// Seven -> G101, G102, G103...
//

studentSchema.pre("save", async function () {
  // যদি আগে থেকেই ID থাকে তাহলে নতুন ID generate করবে না
  if (this.studentId) {
    return;
  }

  const Student = mongoose.model("Student");

  // Class অনুযায়ী Prefix
  const classPrefixes = {
    One: "A",
    Two: "B",
    Three: "C",
    Four: "D",
    Five: "E",
    Six: "F",
    Seven: "G",
  };

  const prefix = classPrefixes[this.className];

  // Invalid class হলে error
  if (!prefix) {
    throw new Error("Invalid class name");
  }

  // এই class-এর সর্বশেষ student খুঁজে বের করবে
  const lastStudent = await Student.findOne({
    studentId: new RegExp(`^${prefix}\\d+$`),
  })
    .sort({ studentId: -1 })
    .select("studentId");

  // শুরু হবে 101 থেকে
  let nextNumber = 101;

  // যদি আগে student থাকে তাহলে তার পরের number হবে
  if (lastStudent?.studentId) {
    const lastNumber = parseInt(lastStudent.studentId.substring(1), 10);

    nextNumber = lastNumber + 1;
  }

  // Final Student ID
  this.studentId = `${prefix}${nextNumber}`;
});

// =========================
// MODEL
// =========================

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
