import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";

export default function IntroPage() {
  const [step, setStep] = useState(0);
  const [logoMode, setLogoMode] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { username, password } = location.state || {};

  useEffect(() => {
    if (!username || !password) {
      navigate("/register");
    }
  }, [username, password, navigate]);

  useEffect(() => {
    if (!logoMode) {
      const timer = setInterval(() => {
        setStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [logoMode]);

  const triggerConfetti = () => {
    const duration = 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleReady = () => {
    setCelebrate(true);
    triggerConfetti();
    setTimeout(() => {
      setLogoMode(true);
      setCelebrate(false);
      setTimeout(() => {
        navigate("/questions", { state: { username, password } });
      }, 2000);
    }, 1500);
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gray-900 text-white overflow-hidden">
      {celebrate && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-4xl font-bold text-yellow-300"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            🎉 Hurray! Let's get started! 🎉
          </motion.h1>
        </motion.div>
      )}

      <motion.img
        src="/dumbbell.png"
        alt="Dumbbell"
        className="w-32 h-32 drop-shadow-[0_0_20px_#00ffcc]"
        animate={
          logoMode
            ? { top: "1rem", left: "1rem", x: 0, y: 0, scale: 0.4, rotate: 0 }
            : { rotate: 360 }
        }
        initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
        transition={{
          duration: logoMode ? 1.5 : 5,
          ease: logoMode ? "easeInOut" : "linear",
          repeat: logoMode ? 0 : Infinity,
        }}
        style={{ position: "absolute", top: "50%", left: "50%" }}
      />

      {logoMode && (
        <motion.h1
          className="absolute top-6 left-20 text-3xl font-bold text-neon"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Fitspire
        </motion.h1>
      )}

      <AnimatePresence>
        {!logoMode && !celebrate && (
          <motion.div
            key={step}
            className="absolute bottom-36 text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            {step === 0 && (
              <h2 className="text-3xl font-semibold">
                Let's begin your fitness journey! 💪
              </h2>
            )}
            {step === 1 && (
              <h2 className="text-3xl font-semibold">
                We’d like to ask a few questions...
              </h2>
            )}
            {step === 2 && (
              <div>
                <h2 className="text-3xl font-semibold mb-4">Are you ready?</h2>
                <button
                  onClick={handleReady}
                  className="px-6 py-2 bg-teal-500 text-gray-900 font-bold rounded hover:bg-teal-300 transition hover:scale-105"
                >
                  I'm Ready
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
