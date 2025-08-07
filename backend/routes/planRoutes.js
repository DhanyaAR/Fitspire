const express = require("express");
const generatePlan = require("../utils/generatePlan");

const router = express.Router();

router.post("/generate-plan", (req, res) => {
  try {
    const { goal, equipment, level, duration } = req.body;
    console.log("Received inputs from frontend:", { goal, level, equipment, duration });
    const plan = generatePlan(goal, level, equipment, duration);
    return res.json({ success: true, plan }); 
  } catch (error) {
    console.error("Error in /generate-plan route:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
