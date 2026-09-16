const Batch = require("../models/batch");



// ===============================
// Create Batch
// ===============================

const createBatch = async (req, res) => {

  try {

    const batch = await Batch.create(req.body);


    res.status(201).json({

      success: true,

      message: "Batch created successfully",

      data: batch,

    });


  } catch (error) {


    res.status(500).json({

      success: false,

      message: error.message,

    });


  }

};








// ===============================
// Get All Batches
// ===============================

const getBatches = async (req, res) => {


  try {


    const {

      className,

      time,

      day,

      status,

    } = req.query;



    const filter = {};



    if(className){

      filter.className = className;

    }



    if(time){

      filter.time = time;

    }



    if(day){

      filter.days = day;

    }



    if(status){

      filter.status = status;

    }




    const batches = await Batch.find(filter)

      .sort({

        createdAt:-1

      });



    res.status(200).json({

      success:true,

      data:batches,

    });



  } catch(error){


    res.status(500).json({

      success:false,

      message:error.message,

    });


  }


};









// ===============================
// Get Single Batch
// ===============================

const getSingleBatch = async(req,res)=>{


  try{


    const batch = await Batch.findById(req.params.id);



    if(!batch){

      return res.status(404).json({

        success:false,

        message:"Batch not found"

      });

    }



    res.status(200).json({

      success:true,

      data:batch,

    });



  }catch(error){


    res.status(500).json({

      success:false,

      message:error.message,

    });


  }


};









// ===============================
// Update Batch
// ===============================

const updateBatch = async(req,res)=>{


  try{


    const batch = await Batch.findByIdAndUpdate(

      req.params.id,

      req.body,

      {

        new:true,

        runValidators:true,

      }

    );



    if(!batch){

      return res.status(404).json({

        success:false,

        message:"Batch not found"

      });

    }




    res.status(200).json({

      success:true,

      message:"Batch updated successfully",

      data:batch,

    });



  }catch(error){


    res.status(500).json({

      success:false,

      message:error.message,

    });


  }


};









// ===============================
// Delete Batch
// ===============================

const deleteBatch = async(req,res)=>{


  try{


    const batch = await Batch.findByIdAndDelete(

      req.params.id

    );



    if(!batch){

      return res.status(404).json({

        success:false,

        message:"Batch not found"

      });

    }



    res.status(200).json({

      success:true,

      message:"Batch deleted successfully",

    });



  }catch(error){


    res.status(500).json({

      success:false,

      message:error.message,

    });


  }


};









module.exports = {


  createBatch,

  getBatches,

  getSingleBatch,

  updateBatch,

  deleteBatch,


};