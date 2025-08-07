const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

router.post("/check-username", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    res.json({ exists: !!user }); 
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.post("/register", async (req, res) => {
  try {
    const { username, password, goal, level, equipment, duration, plan } = req.body;

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const today = new Date();
    const workoutHistory = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      workoutHistory.push({
        date: date.toISOString().split("T")[0],
        didWorkout: false,
      });
    }

    const newUser = new User({
      username,
      password: hashedPassword, 
      goal,
      level,
      equipment,
      duration,
      plan,
      streak: 0,
      totalWorkoutDays: 0,
      loginDate: new Date(),
      totalWorkoutTime:0,    
      lastWorkoutDate: null,
      totalCaloriesBurnt:0,
      workoutHistory
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.loginDate) {
      user.loginDate = new Date();
    }

    const now = new Date();
    const lastWorkout = user.lastWorkoutDate;

    if (lastWorkout) {
      const diffInMs = now - lastWorkout; 
      const hoursSinceLastWorkout = diffInMs / (1000 * 60 * 60);

      if (hoursSinceLastWorkout >= 24) {
        user.streak = 0;
        await user.save();  
      }
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const lastDateStr = user.workoutHistory?.[user.workoutHistory.length - 1]?.date;

    if (lastDateStr && lastDateStr !== todayStr) {
      const lastDate = new Date(lastDateStr);
      const today = new Date(todayStr);
      const diffInDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      for (let i = 1; i <= diffInDays; i++) {
        const newDate = new Date(lastDate);
        newDate.setDate(lastDate.getDate() + i);
        user.workoutHistory.push({
          date: newDate.toISOString().split("T")[0],
          didWorkout: false,
        });
      }

      while (user.workoutHistory.length > 90) {
        user.workoutHistory.shift();
      }

      await user.save();
    }

    res.status(200).json({
      plan: user.plan,
      streak: user.streak,
      username: user.username,
      duration: user.duration,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
