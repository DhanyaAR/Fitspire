import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <motion.img
        src="/dumbbell.png"
        alt="Dumbbell"
        className="w-32 h-32 drop-shadow-[0_0_20px_#00ffcc]"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
      />
      <h1 className="mt-6 text-4xl font-bold text-neon">Welcome to Fitspire</h1>
      <p className="mt-2 text-lg text-gray-300">Your Personal Fitness App</p>
      <p className="mt-2 text-xl italic text-gray-300">One Goal. One Grind. One You.</p>

      <div className="mt-8 flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/register")}
          className="px-8 py-2 bg-teal-500 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-teal-400 transition"
        >
          Sign Up
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/login")}
          className="px-8 py-2 bg-teal-500 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-teal-400 transition"
        >
          Login
        </motion.button>
      </div>
    </div>
  );
}
