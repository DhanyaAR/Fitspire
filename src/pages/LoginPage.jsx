import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useUser } from "../context/UserContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUsername: setGlobalUsername } = useUser();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
  
      const { plan, streak } = res.data;
      console.log("Plan received at login:", plan);

      setGlobalUsername(username);
      navigate("/display-plan", {
        state: { plan, username, streak },
      });
    } catch (err) {
      alert("Invalid credentials");
    }
  };
  

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-80"
      >
        <h1 className="text-3xl font-bold text-center text-teal-400 mb-6">
          Login
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

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold py-2 rounded-lg shadow-md transition"
        >
          Login
        </motion.button>

        <p className="mt-4 text-center text-gray-400">
          Don't have an account?{" "}
          <span
            className="text-teal-400 cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </span>
        </p>
      </motion.div>
    </div>
  );
}
