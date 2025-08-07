const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  goal: String,
  level: String,
  equipment: String,
  duration: Number,
  plan: [
    {
      day: Number,
      exercises: [String],
      totalDuration: Number,
    },
  ],
  streak: { type: Number, default: 0 },
  totalWorkoutDays: { type: Number, default: 0 },
  loginDate: { type: Date, default: Date.now },  
  totalWorkoutTime: { type: Number, default: 0 },     
  lastWorkoutDate: { type: Date, default: null },  
  totalCaloriesBurnt: { type: Number, default: 0 },  
  workoutHistory: [
    {
      date: String, // "yyyy-MM-dd"
      didWorkout: Boolean
    }
  ]
});


module.exports = mongoose.model("User", userSchema);
