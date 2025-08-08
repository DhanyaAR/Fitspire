export default function createCobraPoseDetector() {
    let feedbackGiven = {
      backNotArched: false,
      hipsLifted: false,
      elbowsBent: false,
    };
  
    const calculateAngle = (a, b, c) => {
      const radians =
        Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
      let angle = Math.abs((radians * 180.0) / Math.PI);
      return angle > 180 ? 360 - angle : angle;
    };
  
    return function detectCobraPose(landmarks, onFeedback) {
      if (!landmarks) return;
  
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftElbow = landmarks[13];
      const rightElbow = landmarks[14];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];
      const leftKnee = landmarks[25];
      const rightKnee = landmarks[26];
  
      const backAngleLeft = calculateAngle(leftShoulder, leftHip, leftKnee);
      const backAngleRight = calculateAngle(rightShoulder, rightHip, rightKnee);
      const avgBackAngle = (backAngleLeft + backAngleRight) / 2;
  
      const elbowAngleLeft = calculateAngle(leftShoulder, leftElbow, landmarks[15]);
      const elbowAngleRight = calculateAngle(rightShoulder, rightElbow, landmarks[16]);
      const avgElbowAngle = (elbowAngleLeft + elbowAngleRight) / 2;
  
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
  
      if (avgBackAngle > 160 && !feedbackGiven.backNotArched) {
        onFeedback?.("Arch your back more");
        feedbackGiven.backNotArched = true;
      } else if (avgBackAngle <= 160) {
        feedbackGiven.backNotArched = false;
      }
  
      if (avgHipY < avgKneeY - 0.05 && !feedbackGiven.hipsLifted) {
        onFeedback?.("Keep your hips down");
        feedbackGiven.hipsLifted = true;
      } else if (avgHipY >= avgKneeY - 0.05) {
        feedbackGiven.hipsLifted = false;
      }
  
      if (avgElbowAngle < 150 && !feedbackGiven.elbowsBent) {
        onFeedback?.("Straighten your arms more");
        feedbackGiven.elbowsBent = true;
      } else if (avgElbowAngle >= 150) {
        feedbackGiven.elbowsBent = false;
      }
    };
  }
  
