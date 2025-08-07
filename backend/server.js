const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const planRoutes = require("./routes/planRoutes");
const authRoutes = require("./routes/authRoutes"); 
const userRoutes = require("./routes/userRoutes");
const streakRoutes = require("./routes/streakRoutes");


const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", planRoutes);
app.use("/api", authRoutes); 
app.use("/api/user", userRoutes);
app.use("/api/streak", streakRoutes);

const PORT = 5000;
const MONGO_URI = "mongodb+srv://fitnessdbadmin:fitspireapp@fitness.w82vceb.mongodb.net/?retryWrites=true&w=majority&appName=Fitness"; // Or use Atlas URI

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("Mongo Error:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
