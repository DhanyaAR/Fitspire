export default function createPushUpDetector() {
  let reps = 0;
  let direction = "down";
  let lastRepTime = 0;
  let lastFeedbackTime = 0;
  let feedbackState = {
    backBent: false,
    tooFast: false,
    goLower: false,
  };

  const FEEDBACK_COOLDOWN = 1500; 

  const calculateAngle = (a, b, c) => {
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  };

  return function detectPushUp(landmarks, onFeedback) {
    if (!landmarks) return;

    const now = Date.now();

    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];

    const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const avgElbowAngle = (leftAngle + rightAngle) / 2;

    const backAngleLeft = calculateAngle(leftShoulder, leftHip, leftKnee);
    const backAngleRight = calculateAngle(rightShoulder, rightHip, rightKnee);
    const avgBackAngle = (backAngleLeft + backAngleRight) / 2;

    const backBent = avgBackAngle < 150;

    if (backBent && !feedbackState.backBent && now - lastFeedbackTime > FEEDBACK_COOLDOWN) {
      onFeedback?.("Keep your back straight");
      feedbackState.backBent = true;
      lastFeedbackTime = now;
    } else if (!backBent) {
      feedbackState.backBent = false;
    }

    if (avgElbowAngle < 90 && direction === "up" && !feedbackState.goLower && now - lastFeedbackTime > FEEDBACK_COOLDOWN) {
      onFeedback?.("Go lower");
      feedbackState.goLower = true;
      lastFeedbackTime = now;
    } else if (avgElbowAngle >= 90) {
      feedbackState.goLower = false;
    }

    if (avgElbowAngle > 160 && direction === "down") {
      const timeSinceLastRep = now - lastRepTime;

      if (timeSinceLastRep < 700 && !feedbackState.tooFast && now - lastFeedbackTime > FEEDBACK_COOLDOWN) {
        onFeedback?.("Slow down and control your movement");
        feedbackState.tooFast = true;
        lastFeedbackTime = now;
      } else if (timeSinceLastRep >= 700) {
        reps++;
        onFeedback?.(`Good job! Push up ${reps}`);
        lastRepTime = now;
        feedbackState.tooFast = false;
        lastFeedbackTime = now;
      }

      direction = "up";
    }

    if (avgElbowAngle < 90 && direction !== "down") {
      direction = "down";
    }
  };
}
