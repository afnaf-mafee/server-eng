const express = require("express");

const router = express.Router();


const {

  createBatch,

  getBatches,

  getSingleBatch,

  updateBatch,

  deleteBatch,

} = require("../controllers/batchController");





// ===============================
// Batch Routes
// ===============================


// Create Batch
router.post(
  "/",
  createBatch
);



// Get All Batches + Filter
router.get(
  "/",
  getBatches
);



// Get Single Batch
router.get(
  "/:id",
  getSingleBatch
);



// Update Batch
router.patch(
  "/:id",
  updateBatch
);



// Delete Batch
router.delete(
  "/:id",
  deleteBatch
);



module.exports = router;