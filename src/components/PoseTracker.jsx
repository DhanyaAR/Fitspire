import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import createPushUpDetector from "../utils/poseDetection/pushUpDetector";
import createSquatDetector from "../utils/poseDetection/squatDetector";
import createPlankDetector from "../utils/poseDetection/plankDetector";
import createCobraPoseDetector from "../utils/poseDetection/cobraPoseDetector";
import createWarrior2PoseDetector from "../utils/poseDetection/warrior2PoseDetector";

const PoseTracker = forwardRef(({ exerciseName, onPoseFeedback }, ref) => {
  const lastDetectionTime = useRef(0);
  const cooldown = 800; 

  const detectors = useRef({});

  useEffect(() => {
    detectors.current = {
      "Push-ups": createPushUpDetector(),
      "Squats": createSquatDetector(),
      "Plank": createPlankDetector(),
      "Cobra Pose (Bhujangasana)": createCobraPoseDetector(),
      "Warrior II (Virabhadrasana II)": createWarrior2PoseDetector(),
    };
  }, []);

  const processLandmarks = (landmarks) => {
    if (!landmarks) return;

    const now = Date.now();
    if (now - lastDetectionTime.current < cooldown) return;
    lastDetectionTime.current = now;

    try {
      const detector = detectors.current[exerciseName];
      if (detector) {
        detector(landmarks, onPoseFeedback);
      } else {
        console.warn(`Unsupported exercise: ${exerciseName}`);
      }
    } catch (err) {
      console.error("Pose detection error:", err);
    }
  };

  useImperativeHandle(ref, () => ({
    handleLandmarks: (landmarks) => {
      processLandmarks(landmarks);
    },
  }));

  return null;
});

export default PoseTracker;
