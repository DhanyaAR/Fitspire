export default function createWarrior2PoseDetector() {
  let feedbackGiven = {
    frontKneeNotBent: false,
    backLegBent: false,
    armsNotStraight: false,
  };

  let lastFeedbackTime = 0;
  const FEEDBACK_COOLDOWN = 1500;

  const calculateAngle = (a, b, c) => {
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  };

  return function detectWarrior2(landmarks, onFeedback) {
    if (!landmarks) return;
    const now = Date.now();

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    const frontKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const backKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    const leftArmAngle = calculateAngle(leftWrist, leftElbow, leftShoulder);
    const rightArmAngle = calculateAngle(rightWrist, rightElbow, rightShoulder);
    const avgArmAngle = (leftArmAngle + rightArmAngle) / 2;

    if (frontKneeAngle > 110 && !feedbackGiven.frontKneeNotBent && now - lastFeedbackTime > FEEDBACK_COOLDOWN) {
      onFeedback?.("Bend your front knee more");
      feedbackGiven.frontKneeNotBent = true;
      lastFeedbackTime = now;
    } else if (frontKneeAngle <= 110) {
      feedbackGiven.frontKneeNotBent = false;
    }

    if (backKneeAngle < 170 && !feedbackGiven.backLegBent && now - lastFeedbackTime > FEEDBACK_COOLDOWN) {
      onFeedback?.("Straighten your back leg");
      feedbackGiven.backLegBent = true;
      lastFeedbackTime = now;
    } else if (backKneeAngle >= 170) {
      feedbackGiven.backLegBent = false;
    }

    if (avgArmAngle < 160 && !feedbackGiven.armsNotStraight && now - lastFeedbackTime > FEEDBACK_COOLDOWN) {
      onFeedback?.("Keep your arms straight and lifted");
      feedbackGiven.armsNotStraight = true;
      lastFeedbackTime = now;
    } else if (avgArmAngle >= 160) {
      feedbackGiven.armsNotStraight = false;
    }
  };
}
