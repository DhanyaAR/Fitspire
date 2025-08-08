import { useLocation } from "react-router-dom";
import exercisesData from "../data/exercises.json";
import { useState, useEffect, useRef,useMemo } from "react";
import React, { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
const PoseProvider = lazy(() => import("../components/PoseProvider"));
const PoseTracker = lazy(() => import("../components/PoseTracker"));

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

const POSE_SUPPORTED = [
  "Squats",
  "Push-ups",
  "Plank",
  "Cobra Pose (Bhujangasana)",
  "Warrior II (Virabhadrasana II)",
];  //pose detection supported for these exercises

export default function StartWorkoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { exercises: exerciseIds, username, time } = state;
  const poseRef = useRef();
  const completedSetsIncrementedRef = useRef(false);

  if (!exerciseIds || !username) {
    return (
      <div className="text-white p-6">
        Invalid workout session. Please start from the dashboard.
      </div>
    );
  }

  const allExercises = exerciseIds.map((id) =>
    exercisesData.find((ex) => ex.id === Number(id))
  );

  const totalSets = useMemo(() => {
    return allExercises.reduce((sum, ex) => sum + ex.sets, 0);
  }, [allExercises]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [setNum, setSetNum] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [phase, setPhase] = useState("init");
  const [hasSpokenMotivation, setHasSpokenMotivation] = useState(false);
  const [streakMessage, setStreakMessage] = useState("");
  const [completedSets, setCompletedSets] = useState(0); 

  const [shownMotivations, setShownMotivations] = useState([]);
  const motivationalPhrases = [
    "Keep going!",
    "You're doing great!",
    "Push through!",
    "Stay strong!",
    "Almost there!",
    "Keep it up!",
  ];
  const [currentMotivation, setCurrentMotivation] = useState("");

  const currentExercise = allExercises[currentIndex];

  const workoutMusicRef = useRef(null);
  const restMusicRef = useRef(null);
  const countdownSoundRef = useRef(null);
  const lastSpokenCountdownRef = useRef(null);
  const poseTrackerRef = useRef();

  const speak = (text) => {
    if (!isMuted) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = speechSynthesis.getVoices();
      const samanthaVoice = voices.find(
        (voice) => voice.name === "Samantha" && voice.lang.startsWith("en")
      );
      if (samanthaVoice) {
        utterance.voice = samanthaVoice;
      }

      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    workoutMusicRef.current = new Audio("/sounds/workout-music.mp3");
    workoutMusicRef.current.loop = true;
    restMusicRef.current = new Audio("/sounds/relax-music.mp3");
    restMusicRef.current.loop = true;
    countdownSoundRef.current = new Audio("/sounds/countdown.mp3");
  }, []);

  const startWorkout = () => {
    workoutMusicRef.current?.load();
    restMusicRef.current?.load();
    countdownSoundRef.current?.load();
    setShowOverlay(true);
    setPhase("overlay");
    speechSynthesis.cancel();
    setTimeout(() => {
      setShowOverlay(false);
      setCountdown(3);
      setPhase("countdown");
    }, 6000);
  };

  useEffect(() => {
    if (phase === "overlay" && currentExercise) {
      speechSynthesis.cancel();
      setTimeout(() => {
        speak(`Next exercise: ${currentExercise.name}`);
      }, 500); 
    }
  }, [phase, currentExercise]);

  useEffect(() => {
    if (!POSE_SUPPORTED.includes(currentExercise?.name)) {
      poseRef.current?.stopCamera();
    }
  }, [currentExercise]);

  useEffect(() => {
    if (phase === "complete") {
      try {
        poseRef.current?.stopCamera();
      } catch (err) {
        console.warn("Error stopping camera on completion:", err);
      }
    }
  }, [phase]);
  

  useEffect(() => {
    if (phase === "complete") {
      setTimeout(() => {
        speak("Great job! Workout complete! You're amazing!");
      }, 300);

      fetch("http://localhost:5000/api/streak/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, time }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Server error");

          const currentStreak = parseInt(sessionStorage.getItem("fitspireStreak") || "0");
          const updatedStreak = currentStreak + 1;
          sessionStorage.setItem("fitspireStreak", updatedStreak.toString());
          setStreakMessage("🔥 Streak updated!");

          setTimeout(() => setStreakMessage(""), 4000);
        })
        .catch((err) => {
          console.error("Failed to update streak", err);
          setStreakMessage("⚠️ Failed to update streak");

          setTimeout(() => setStreakMessage(""), 4000);
        });
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      try {
        poseRef.current?.stopCamera();
      } catch (err) {
        console.warn("Failed to stop camera on unmount:", err);
      }
    };
  }, []);

  useEffect(() => {
    if (phase === "countdown") {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) {
            if (lastSpokenCountdownRef.current !== prev) {
              speak(`${prev}`);
              lastSpokenCountdownRef.current = prev;
            }
            return prev - 1;
          } else if (prev === 1) {
            if (lastSpokenCountdownRef.current !== 1) {
              speak("1");
              lastSpokenCountdownRef.current = 1;
            }
            setTimeout(() => {
              setTimer(currentExercise.reps);
              setPhase("exercise");
              setCurrentMotivation("");
              setHasSpokenMotivation(false);
            }, 1000);

            clearInterval(countdownInterval);
            return 0;
          }
        });
      }, 1000);
      return () => clearInterval(countdownInterval);
    }
  }, [phase, currentExercise]);

  useEffect(() => {
    speechSynthesis.cancel();
    let interval = null;
    if (
      (phase === "exercise" || phase === "rest" || phase === "between") &&
      !isPaused
    ) {
      completedSetsIncrementedRef.current = false;
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev > 0) {
            if (phase === "exercise") {
              if (prev === 4) {
                if (workoutMusicRef.current) {
                  workoutMusicRef.current.volume = 0.2;
                }
                if (!isMuted) {
                  countdownSoundRef.current
                    ?.play()
                    .catch((err) =>
                      console.warn("Countdown sound blocked:", err)
                    );
                }
              }

              if (
                prev === Math.floor(currentExercise.reps / 2) &&
                !hasSpokenMotivation
              ) {
                setHasSpokenMotivation(true); 

                const remaining = motivationalPhrases.filter(
                  (m) => !shownMotivations.includes(m)
                );

                let phrase = "";

                if (remaining.length > 0) {
                  phrase =
                    remaining[Math.floor(Math.random() * remaining.length)];
                  setShownMotivations((prev) => [...prev, phrase]);
                } else {
                  phrase = "You're doing great! Keep going!";
                  setShownMotivations([]);
                }

                setCurrentMotivation(phrase);
                window.speechSynthesis.cancel();
                setTimeout(() => speak(phrase), 100);
                setTimeout(() => setCurrentMotivation(""), 2000);
              }
            }
            return prev - 1;
          }

          clearInterval(interval);

          if (phase === "exercise") {
            workoutMusicRef.current.pause();
            workoutMusicRef.current.currentTime = 0;

            if (!completedSetsIncrementedRef.current) {
              console.log("Incrementing completedSets once for this set");
              setCompletedSets((prev) => prev + 1);
              completedSetsIncrementedRef.current = true;
            }            

            if (setNum < currentExercise.sets) {
              setSetNum((s) => s + 1);
              setHasSpokenMotivation(false);
              setTimer(currentExercise.rest || 20);
              setPhase("rest");
            } else {
              if (currentIndex < allExercises.length - 1) {
                setTimer(20);
                setPhase("between");
              } else {
                setPhase("complete");
              }
            }
          } else if (phase === "rest") {
            restMusicRef.current.pause();
            restMusicRef.current.currentTime = 0;
            setCountdown(3);
            setPhase("countdown");
          } else if (phase === "between") {
            if (currentIndex < allExercises.length - 1) {
              setCurrentIndex((i) => i + 1);
              setSetNum(1);
              setHasSpokenMotivation(false);
              setShownMotivations([]);
              setShowOverlay(true);
              setPhase("overlay");
              setTimeout(() => {
                setShowOverlay(false);
                setCountdown(3);
                setPhase("countdown");
              }, 5000);
            } else {
              setPhase("complete");
            }
          }

          return 0;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [phase, isPaused, currentExercise, setNum, currentIndex, isMuted, hasSpokenMotivation, shownMotivations]);

    if (isPaused || isMuted) {
      workoutMusicRef.current?.pause();
      restMusicRef.current?.pause();
    } else {
      if (phase === "exercise") {
        workoutMusicRef.current
          ?.play()
          .catch((err) => console.warn("Workout music blocked:", err));
        restMusicRef.current?.pause();
      } else if (phase === "rest" || phase === "between") {
        restMusicRef.current
          ?.play()
          .catch((err) => console.warn("Rest music blocked:", err));
        workoutMusicRef.current?.pause();
      } else {
        workoutMusicRef.current?.pause();
        restMusicRef.current?.pause();
      }
    }

  const pauseTimer = () => setIsPaused(true);
  const resumeTimer = () => setIsPaused(false);
  const resetTimer = () => {
    if (phase === "exercise") setTimer(currentExercise.reps);
    else if (phase === "rest" || phase === "between"){
      setTimer(currentExercise.rest || 20);
    }
  };
  const skipRest = () => {
    restMusicRef.current.pause();
    restMusicRef.current.currentTime = 0;
    setCountdown(3);
    setPhase("countdown");
  };

  if (!currentExercise && phase !== "complete") return <div>Loading...</div>;

  if (!state || !state.exercises || !state.username) {
    return (
      <div className="text-white p-6">
        Invalid workout session. Please start from the dashboard.
      </div>
    );
  }

  const progressPercentage = Math.min(
    100,
    Math.floor((completedSets / totalSets) * 100)
  );

  return (
    <div className="flex min-h-screen relative">
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      <div className="w-1/4 bg-gray-800 p-4 text-white space-y-2 overflow-y-auto">
        {allExercises.map((ex, i) => (
          <div
            key={ex.id}
            className={`p-3 rounded-lg flex items-center space-x-3 transition-all duration-300 cursor-pointer ${
              i === currentIndex
                ? "bg-teal-500 text-black"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            <img
              src={ex.image}
              alt={ex.name}
              className="w-12 h-12 rounded object-cover border border-gray-400"
            />
            <div>
              <div className="font-semibold text-sm">{ex.name}</div>
              <div className="text-xs">
                {ex.duration} min | {ex.sets} sets
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 p-8 bg-gray-900 text-white relative">
        {phase === "init" && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-4xl font-bold mb-6">Ready to Start, {username}?</h1>
            <button
              onClick={startWorkout}
              className="px-8 py-3 bg-teal-500 text-black rounded-xl font-semibold hover:bg-teal-400 transition duration-300"
            >
              Let’s Go!
            </button>
          </div>
        )}

        {phase !== "init" && phase !== "complete" && (
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4">{currentExercise.name}</h2>
            <img
              src={currentExercise.image}
              alt={currentExercise.name}
              className="w-64 h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-lg text-gray-300 max-w-xxl text-center mb-6">
              {currentExercise.description}
            </p>

            {phase === "countdown" && (
              <div className="text-4xl font-bold text-yellow-400 mb-4 animate-pulse">
                Countdown Starts in: {countdown}
              </div>
            )}

            {phase === "exercise" && (
              <>
                <div className="text-2xl mb-2">
                  Set: {setNum} of {currentExercise.sets}
                </div>
                <div className="text-5xl font-mono text-teal-400 mb-4">
                  {formatTime(timer)}
                </div>

                {POSE_SUPPORTED.includes(currentExercise.name) && (
                  <Suspense fallback={<div>Loading Pose Detection...</div>}>
                    <PoseProvider
                      ref={poseRef}
                      onPoseDetected={(landmarks) =>
                        poseTrackerRef.current?.handleLandmarks(landmarks)
                      }
                    />
                    <PoseTracker
                      ref={poseTrackerRef}
                      exerciseName={currentExercise.name}
                      onPoseFeedback={(msg) => speak(msg)}
                    />
                  </Suspense>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={pauseTimer}
                    className="px-5 py-2 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    Pause
                  </button>
                  <button
                    onClick={resumeTimer}
                    className="px-5 py-2 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    Resume
                  </button>
                  <button
                    onClick={resetTimer}
                    className="px-5 py-2 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    Reset
                  </button>
                </div>

                <div className="w-full max-w-xl mt-6">
                  <div className="w-full bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-teal-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-gray-300 mt-1">
                    Progress: {progressPercentage}%
                  </div>
                </div>

                {currentMotivation && (
                  <div className="text-xl text-yellow-300 mt-4 animate-pulse">
                    {currentMotivation}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {(phase === "rest" || phase === "between") && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white z-50">
            <h2 className="text-3xl font-bold mb-4">
              {phase === "between"
                ? "Break before next exercise"
                : "Rest"}
            </h2>
            <div className="text-5xl font-mono text-yellow-400 mb-6">
              {formatTime(timer)}
            </div>
            {phase === "rest" && (
              <button
                onClick={skipRest}
                className="px-5 py-2 bg-yellow-600 rounded hover:bg-yellow-500"
              >
                Skip Rest
              </button>
            )}
          </div>
        )}

        {phase === "overlay" && showOverlay && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white animate-fade-in">
            <p className="text-3xl mb-4 font-bold">Next: {currentExercise.name}</p>
            <img
              src={currentExercise.image}
              alt={currentExercise.name}
              className="w-48 h-48 object-cover animate-pulse rounded-lg"
            />
          </div>
        )}

        {phase === "complete" && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-4xl font-bold mb-6">🎉 Workout Complete!</h1>
            <p className="text-xl text-gray-300">Great job, {username}! 🔥</p>
            <p className="text-lg text-yellow-400 font-semibold mt-4 mb-4">
              Total Calories Burned: {time * 5} kcal
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition duration-300"
            >
              Go to Dashboard
            </button>
            <p
              className={`text-lg mt-4 ${
                streakMessage.includes("Failed")
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {streakMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
