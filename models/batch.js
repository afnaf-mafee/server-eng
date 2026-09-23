const mongoose = require("mongoose");


const batchSchema = new mongoose.Schema(

  {

 

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

    

    },


    time: {

      type: String,

      required: true,

     
     enum: [
  "Morning",
  "Afternoon",
  "Evening",
  "Night"
],

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