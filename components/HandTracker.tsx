import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export interface HandCursor {
  x: number;
  y: number;
  isPinching: boolean;
}

export const HandTracker = ({ onUpdate }: { onUpdate: (cursor: HandCursor | null) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let handLandmarker: HandLandmarker;
    let animationFrameId: number;
    let isActive = true;

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        if (!isActive) return;
        setIsLoaded(true);

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current && isActive) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener("loadeddata", predictWebcam);
          }
        }
      } catch (err) {
        console.error("Error initializing hand tracking:", err);
      }
    };

    let lastVideoTime = -1;
    const predictWebcam = async () => {
      if (!videoRef.current || !handLandmarker || !isActive) return;
      
      let startTimeMs = performance.now();
      if (lastVideoTime !== videoRef.current.currentTime) {
        lastVideoTime = videoRef.current.currentTime;
        const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);
        
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const indexTip = landmarks[8];
          const thumbTip = landmarks[4];
          
          const distance = Math.sqrt(
            Math.pow(indexTip.x - thumbTip.x, 2) + 
            Math.pow(indexTip.y - thumbTip.y, 2) + 
            Math.pow(indexTip.z - thumbTip.z, 2)
          );
          
          const isPinching = distance < 0.05;
          
          const x = (indexTip.x + thumbTip.x) / 2;
          const y = (indexTip.y + thumbTip.y) / 2;
          
          // Mirror x coordinate
          onUpdate({ x: 1 - x, y, isPinching });
        } else {
          onUpdate(null);
        }
      }
      if (isActive) {
        animationFrameId = requestAnimationFrame(predictWebcam);
      }
    };

    init();

    return () => {
      isActive = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (handLandmarker) handLandmarker.close();
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onUpdate]);

  return (
    <div className="fixed top-4 right-4 w-24 h-16 sm:w-32 sm:h-24 bg-black rounded-lg overflow-hidden shadow-lg border-2 border-white/20 z-50 opacity-80 hover:opacity-100 transition-opacity">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
      {!isLoaded && <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] sm:text-xs bg-black/50 text-center p-1">正在加载 AI...</div>}
    </div>
  );
};
