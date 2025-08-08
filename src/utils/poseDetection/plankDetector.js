const calculateAngle = (a, b, c) => {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  return angle > 180 ? 360 - angle : angle;
};

export default function createPlankDetector() {
  let feedbackGiven = {
    hipsTooLow: false,
    hipsTooHigh: false,
    backNotStraight: false,
  };

  let cooldowns = {
    hipsTooLow: false,
    hipsTooHigh: false,
    backNotStraight: false,
  };

  function giveFeedback(type, message, onFeedback) {
    if (!cooldowns[type]) {
      onFeedback?.(message);
      feedbackGiven[type] = true;
      cooldowns[type] = true;

      setTimeout(() => {
        cooldowns[type] = false;
      }, 3000); 
    }
  }

  return function detectPlank(landmarks, onFeedback) {
    if (!landmarks) return;

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    const leftBackAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
    const rightBackAngle = calculateAngle(rightShoulder, rightHip, rightAnkle);
    const avgBackAngle = (leftBackAngle + rightBackAngle) / 2;

    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgHipY = (leftHip.y + rightHip.y) / 2;
    const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;

    const shoulderToAnkle = avgAnkleY - avgShoulderY;
    const hipToShoulder = avgHipY - avgShoulderY;
    const hipRatio = hipToShoulder / shoulderToAnkle;

    if (avgBackAngle >= 160) {
      feedbackGiven.backNotStraight = false;
    }
    if (hipRatio >= 0.35 && hipRatio <= 0.65) {
      feedbackGiven.hipsTooLow = false;
      feedbackGiven.hipsTooHigh = false;
    }

    if (hipRatio > 0.65 && !feedbackGiven.hipsTooHigh) {
      onFeedback?.("Your hips are too high");
      feedbackGiven.hipsTooHigh = true;
      feedbackGiven.hipsTooLow = false;
      feedbackGiven.backNotStraight = false; 
    } else if (hipRatio < 0.35 && !feedbackGiven.hipsTooLow) {
      onFeedback?.("Your hips are too low");
      feedbackGiven.hipsTooLow = true;
      feedbackGiven.hipsTooHigh = false; 
    } else if (avgBackAngle < 150 && !feedbackGiven.backNotStraight) {
      onFeedback?.("Keep your back straight");
      feedbackGiven.backNotStraight = true;
    } else if (
      hipRatio >= 0.35 && hipRatio <= 0.65 && 
      avgBackAngle >= 150
    ) {
      feedbackGiven.hipsTooHigh = false;
      feedbackGiven.hipsTooLow = false;
      feedbackGiven.backNotStraight = false;
    }
  }    
}
