const mongoose = require("mongoose");


const batchSchema = new mongoose.Schema(

  {

    batchName: {

      type: String,

      required: true,

      trim: true,

      maxlength: 100,

    },


    className: {

      type: String,

      required: true,

      enum: [

        "One",

        "Two",

        "Three",

        "Four",

        "Five",

        "Six"

      ],

    },


    days: {

      type: [String],

      required: true,

      validate: {

        validator: function(value) {

          return value.length > 0 && value.length <= 3;

        },

        message: "Select minimum 1 and maximum 3 days"

      }

    },


    time: {

      type: String,

      required: true,

      enum: [

        "দুপুর",

        "বিকেল",

        "সন্ধ্যা"

      ],

    },


    status: {

      type: String,

      enum: [

        "Active",

        "Inactive"

      ],

      default: "Active"

    },


  },


  {

    timestamps: true,

  }

);



const Batch = mongoose.model(

  "Batch",

  batchSchema

);


module.exports = Batch;