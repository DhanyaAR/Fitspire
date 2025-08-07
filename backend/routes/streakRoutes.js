const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/complete", async (req, res) => {
  try {
    const { username, time } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.streak = (user.streak || 0) + 1;
    user.lastWorkoutDate = new Date();
    user.totalWorkoutDays = (user.totalWorkoutDays || 0) + 1;
    user.totalWorkoutTime=(user.totalWorkoutTime||0)+time;
    user.totalCaloriesBurnt=(user.totalCaloriesBurnt||0)+(time * 5)

    const todayStr = new Date().toISOString().split("T")[0];
    const todayEntry = user.workoutHistory.find(entry => entry.date === todayStr);

    if (todayEntry) {
      todayEntry.didWorkout = true;
    } else {
      user.workoutHistory.push({ date: todayStr, didWorkout: true });

      while (user.workoutHistory.length > 90) {
        user.workoutHistory.shift();
      }
    }

    await user.save();

    res.sendStatus(204);
  } catch (error) {
    console.error("Error updating workout progress:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
