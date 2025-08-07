const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/stats", async (req, res) => {
  try {
    const { username } = req.body;
    console.log("📥 Stats requested for user:", username);
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const today = new Date();
    const registrationDate = user.loginDate;
    const totalDays = Math.floor((today - registrationDate) / (1000 * 60 * 60 * 24)) + 1;
    const workoutPercentage = Math.round((user.totalWorkoutDays / totalDays) * 100);

    res.json({
      streak: user.streak,
      totalWorkoutDays: user.totalWorkoutDays,
      totalWorkoutTime: user.totalWorkoutTime,
      registrationDate: user.loginDate ? user.loginDate.toISOString() : null,
      totalDaysSinceRegistration: totalDays,
      workoutPercentage,
      totalCaloriesBurnt: user.totalCaloriesBurnt,
      workoutHistory: user.workoutHistory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
