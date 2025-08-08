export default function createSquatDetector() {
  let reps = 0;
  let direction = "down";
  let lastRepTime = 0;
  let lastFeedbackTime = 0;

  let feedbackState = {
    backBent: false,
    leaningForward: false,
    shallowSquat: false,
    tooFast: false,
  };

  const FEEDBACK_COOLDOWN = 1500; 

  const calculateAngle = (a, b, c) => {
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  };

  const detectSquat = (landmarks, onFeedback) => {
    if (!landmarks) return reps;

    const now = Date.now();
    let feedback = null;

    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

    const backAngleLeft = calculateAngle(leftShoulder, leftHip, leftKnee);
    const backAngleRight = calculateAngle(rightShoulder, rightHip, rightKnee);
    const avgBackAngle = (backAngleLeft + backAngleRight) / 2;

    const torsoAngleLeft = calculateAngle(leftKnee, leftHip, leftShoulder);
    const torsoAngleRight = calculateAngle(rightKnee, rightHip, rightShoulder);
    const avgTorsoAngle = (torsoAngleLeft + torsoAngleRight) / 2;

    if (avgBackAngle < 150 && !feedbackState.backBent && now - lastFeedbackTime > FEEDBACK_COOLDOWN) {
      feedback = "Keep your back straight";
      onFeedback?.(feedback);
      feedbackState.backBent = true;
      lastFeedbackTime = now;
    } else if (avgBackAngle >= 150) {
      feedbackState.backBent = false;
    }

    if (avgTorsoAngle > 100 && !feedbackState.leaningForward && now - lastFeedbackTime > FEEDBACK_COOLDOWN) {
      feedback = "Avoid leaning too forward";
      onFeedback?.(feedback);
      feedbackState.leaningForward = true;
      lastFeedbackTime = now;
    } else if (avgTorsoAngle <= 100) {
      feedbackState.leaningForward = false;
    }

    if (avgKneeAngle < 90 && direction !== "down") {
      direction = "down";
    }

    if (avgKneeAngle > 100 && direction === "down" && !feedbackState.shallowSquat && now - lastFeedbackTime > FEEDBACK_COOLDOWN) {
      feedback = "Try to go lower for better form";
      onFeedback?.(feedback);
      feedbackState.shallowSquat = true;
      lastFeedbackTime = now;
    } else if (avgKneeAngle <= 100) {
      feedbackState.shallowSquat = false;
    }

    if (avgKneeAngle < 90 && direction === "down") {
      direction = "up-ready";
    }

    if (avgKneeAngle > 160 && direction === "up-ready") {
      const duration = now - lastRepTime;

      if (duration < 700 && !feedbackState.tooFast && now - lastFeedbackTime > FEEDBACK_COOLDOWN) {
        onFeedback?.("Slow down and control your movement");
        feedbackState.tooFast = true;
        lastFeedbackTime = now;
      } else if (duration >= 700) {
        reps += 1;
        onFeedback?.(`Good job! Squat ${reps}`);
        lastRepTime = now;
        feedbackState.tooFast = false;
        lastFeedbackTime = now;
      }

      direction = "up";
    }
  };

  return detectSquat;
}
