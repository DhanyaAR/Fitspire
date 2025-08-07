import {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const PoseProvider = forwardRef(({ onPoseDetected }, ref) => {
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const poseRef = useRef(null);
  const lastPoseTimeRef = useRef(Date.now());

  const [cameraStarted, setCameraStarted] = useState(false);
  const cameraStartedRef = useRef(false);

  // Keep cameraStartedRef in sync with state
  useEffect(() => {
    cameraStartedRef.current = cameraStarted;
  }, [cameraStarted]);

  const handleNewPose = useCallback(
    (landmarks) => {
      const now = Date.now();
      if (now - lastPoseTimeRef.current > 800) {
        lastPoseTimeRef.current = now;
        onPoseDetected(landmarks);
      }
    },
    [onPoseDetected]
  );

  useImperativeHandle(ref, () => ({
    stopCamera: () => {
      if (!cameraStartedRef.current) return;
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }

      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.warn("Track stop failed", e);
          }
        });
        videoRef.current.srcObject = null;
      }

      setCameraStarted(false);
    },
    isCameraStarted: () => cameraStartedRef.current, 
  }));

  useEffect(() => {
    let isMounted = true;

    const videoElement = videoRef.current;
    if (!videoElement || cameraStartedRef.current) return;

    const setupPoseDetection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;

        await new Promise((resolve) => {
          videoElement.onloadeddata = () => resolve();
        });

        if (!isMounted) return;

        const pose = new Pose({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
          if (results.poseLandmarks) {
            handleNewPose(results.poseLandmarks);
          }
        });

        const camera = new Camera(videoElement, {
          onFrame: async () => {
            try {
              await pose.send({ image: videoElement });
            } catch (err) {
              console.error("Pose send error:", err);
            }
          },
          width: 640,
          height: 480,
        });

        cameraRef.current = camera;
        poseRef.current = pose;

        await camera.start();

        if (isMounted) {
          setCameraStarted(true);
        }
      } catch (error) {
        console.error("Camera access or setup failed:", error);
        alert("Unable to access your camera. Please check your browser permissions or device settings.");
      }
    };

    setupPoseDetection();

    return () => {
      isMounted = false;

      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }

      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.warn("Track stop failed", e);
          }
        });
        videoRef.current.srcObject = null;
      }

      setCameraStarted(false);
    };
  }, [handleNewPose]);

  return (
    <video
      ref={videoRef}
      style={{ display: "none" }}
      autoPlay
      playsInline
      muted
    />
  );
});

export default PoseProvider;
