import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useUser } from "../context/UserContext";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUsername: setGlobalUsername } = useUser();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/check-username", { username });

      if (res.data.exists) {
        setError("Username already taken. Try another one.");
      } else {
        setError("");
        setGlobalUsername(username);
        navigate("/intro", { state: { username, password } }); 
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  }; 

  return (
    <div className="flex items-center justify-center bg-gray-900 text-white h-screen py-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-80"
      >
        <h1 className="text-3xl font-bold text-center text-teal-400 mb-6">
          Sign Up
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-6 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        {error && <p className="text-sm text-red-500 mt-0 mb-3">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRegister}
          className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold py-2 rounded-lg shadow-md transition"
        >
          Register
        </motion.button>

        <p className="mt-4 text-center text-gray-400">
          Already have an account?{" "}
          <span
            className="text-teal-400 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}
