import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const steps = ["fitness", "goal", "equipment", "duration", "loading"];

export default function QuestionsFlow() {
  const [step, setStep] = useState(0);
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [equipment, setEquipment] = useState("");
  const [duration, setDuration] = useState(45);
  const navigate = useNavigate();
  const location = useLocation();
  const { username, password } = location.state || {};

  const nextStep = () => setStep((prev) => prev + 1);

  useEffect(() => {
    if (steps[step] === "loading") {
      const fetchPlan = async () => {
        try {
          console.log("Generating plan with:", { goal, equipment, fitnessLevel, duration });

          const res = await fetch("http://localhost:5000/api/generate-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              goal,
              equipment,
              level: fitnessLevel,
              duration: Number(duration),
            }),
          });

          const data = await res.json();

          if (data.success && data.plan) {
            const registerRes = await axios.post("http://localhost:5000/api/register", {
              username,
              password,
              goal,
              equipment,
              level: fitnessLevel,
              duration: Number(duration),
              plan: data.plan,
            });

            if (registerRes.status === 201) {
              navigate("/display-plan", {
                state: { plan: data.plan, username, streak: 0 },
              });
            } else {
              console.error("Registration failed:", registerRes);
            }
          } else {
            console.error("Plan generation failed:", data);
          }
        } catch (err) {
          console.error("Error generating plan or registering user:", err);
        }
      };

      fetchPlan();
    }
  }, [step, goal, equipment, fitnessLevel, duration, username, password, navigate]);

  const cardClasses =
    "p-4 rounded-lg shadow-lg bg-gray-800 text-white cursor-pointer transform hover:scale-105 transition duration-300";

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <AnimatePresence mode="wait">
        {steps[step] === "fitness" && (
          <motion.div
            key="fitness"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl mb-3">What’s your fitness level?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["Beginner", "Intermediate", "Advanced"].map((level) => (
                <div
                  key={level}
                  className={`${cardClasses} hover:shadow-[0_0_20px_rgba(168,85,247,0.7)]`}
                  onClick={() => {
                    setFitnessLevel(level);
                    nextStep();
                  }}
                >
                  <img
                    src={`/images/${level.toLowerCase()}.png`}
                    alt={level}
                    className="w-64 h-64 mx-auto"
                  />
                  <p className="mt-3 text-lg font-semibold">{level}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {steps[step] === "goal" && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl mb-3">What’s your main goal?</h2>
            <p className="text-gray-400 mb-8 text-lg">
              Your goal sets the direction. Choose what you want to achieve and we’ll take care of the rest.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
              {[
                { name: "Weight Loss", img: "/images/weight-loss.jpg" },
                { name: "Muscle Gain", img: "/images/muscle-gain.jpg" },
                { name: "General Fitness", img: "/images/general-fitness.webp" },
                { name: "Flexibility", img: "/images/flexibility.jpg" },
              ].map((g) => (
                <div
                  key={g.name}
                  className="relative rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setGoal(g.name);
                    nextStep();
                  }}
                >
                  <img
                    src={g.img}
                    alt={g.name}
                    className="w-full h-60 object-fill transform group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition duration-500"></div>
                  <p className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                    {g.name}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {steps[step] === "equipment" && (
          <motion.div
            key="equipment"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl mb-3">What equipment do you have?</h2>
            <p className="text-gray-400 mb-12 text-lg">
              Don’t have fancy gear? No worries, we can build a killer plan with just your bodyweight!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["Bodyweight", "Basic Dumbbells", "Full Gym"].map((eq) => (
                <div
                  key={eq}
                  className={`${cardClasses} hover:shadow-[0_0_20px_rgba(245,245,220,0.7)]`}
                  onClick={() => {
                    setEquipment(eq);
                    nextStep();
                  }}
                >
                  <img
                    src={`/images/${eq.toLowerCase().replace(/ /g, "-")}.png`}
                    alt={eq}
                    className="w-64 h-64 mx-auto"
                  />
                  <p className="mt-6 text-lg font-semibold">{eq}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {steps[step] === "duration" && (
          <motion.div
            key="duration"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl mb-10">How long do you plan to workout daily?</h2>
            <input
              type="range"
              min="20"
              max="70"
              step="5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-64 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <p className="mt-4 text-lg">{duration} mins/day</p>
            <button
              onClick={nextStep}
              className="mt-20 px-6 py-2 bg-teal-500 text-gray-900 font-bold rounded hover:bg-teal-300 transition transform hover:scale-105 "
            >
              Generate Plan
            </button>
          </motion.div>
        )}

        {steps[step] === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl mb-8">Generating your 7-day workout plan...</h2>
            <motion.div
              className="w-16 h-16 border-4 border-neon border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
