import { useEffect, useRef, useCallback } from "react";

export type GestureType =
  | "open-palm"
  | "point"
  | "swipe-left"
  | "swipe-right"
  | "pinch"
  | "thumbs-up"
  | "fist"
  | "none";

export type GestureEvent = {
  gesture: GestureType;
  landmarks: number[][];
  tipX: number; // normalized 0-1
  tipY: number;
};

interface GestureControllerProps {
  enabled: boolean;
  onGesture: (e: GestureEvent) => void;
  /** canvas to draw skeleton onto */
  previewCanvasRef: React.RefObject<HTMLCanvasElement>;
  /** video element for feed */
  videoRef: React.RefObject<HTMLVideoElement>;
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

function dist(a: number[], b: number[]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function isFingerExtended(tip: number[], pip: number[], wrist: number[]) {
  // Finger is extended when tip is farther from wrist than pip
  return dist(tip, wrist) > dist(pip, wrist) * 1.1;
}

function classifyGesture(lm: number[][]): GestureType {
  if (!lm || lm.length < 21) return "none";

  const wrist = lm[0];
  // Fingertips: thumb=4, index=8, middle=12, ring=16, pinky=20
  // PIPs:       thumb=3, index=6, middle=10, ring=14, pinky=18
  const thumbTip = lm[4], thumbPip = lm[3];
  const indexTip = lm[8], indexPip = lm[6];
  const middleTip = lm[12], middlePip = lm[10];
  const ringTip = lm[16], ringPip = lm[14];
  const pinkyTip = lm[20], pinkyPip = lm[18];

  const thumbExt  = isFingerExtended(thumbTip, thumbPip, wrist);
  const indexExt  = isFingerExtended(indexTip, indexPip, wrist);
  const middleExt = isFingerExtended(middleTip, middlePip, wrist);
  const ringExt   = isFingerExtended(ringTip, ringPip, wrist);
  const pinkyExt  = isFingerExtended(pinkyTip, pinkyPip, wrist);

  const extCount = [thumbExt, indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

  // Pinch: thumb and index close, others folded
  if (dist(thumbTip, indexTip) < 0.06 && !middleExt && !ringExt && !pinkyExt) return "pinch";

  // Fist: all folded
  if (extCount === 0) return "fist";

  // Open palm: all extended
  if (extCount >= 4) return "open-palm";

  // Thumbs up: only thumb extended, hand upright
  if (thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt) return "thumbs-up";

  // Point: only index extended
  if (indexExt && !middleExt && !ringExt && !pinkyExt) return "point";

  return "none";
}

// ── Swipe detection ───────────────────────────────────────────────────────────

const SWIPE_HISTORY_LEN = 10;
const SWIPE_THRESH = 0.25;

// ── Canvas drawing ────────────────────────────────────────────────────────────

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  lm: number[][],
  w: number,
  h: number
) {
  ctx.strokeStyle = "#00D4FF";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#00D4FF";
  ctx.shadowBlur = 6;

  for (const [a, b] of CONNECTIONS) {
    const pa = lm[a], pb = lm[b];
    ctx.beginPath();
    // landmarks are normalized; x is mirrored for selfie view
    ctx.moveTo((1 - pa[0]) * w, pa[1] * h);
    ctx.lineTo((1 - pb[0]) * w, pb[1] * h);
    ctx.stroke();
  }

  ctx.fillStyle = "#00D4FF";
  for (const p of lm) {
    ctx.beginPath();
    ctx.arc((1 - p[0]) * w, p[1] * h, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const GestureController = ({
  enabled,
  onGesture,
  previewCanvasRef,
  videoRef,
}: GestureControllerProps) => {
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const xHistory = useRef<number[]>([]);
  const lastGesture = useRef<GestureType>("none");
  const lastSwipe = useRef<GestureType>("none");
  const swipeCooldown = useRef(false);

  const handleResults = useCallback(
    (results: any) => {
      const canvas = previewCanvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth || 160;
      canvas.height = video.videoHeight || 120;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!results.multiHandLandmarks?.length) {
        lastGesture.current = "none";
        xHistory.current = [];
        return;
      }

      const lm = results.multiHandLandmarks[0].map((p: any) => [p.x, p.y, p.z]);
      drawSkeleton(ctx, lm, canvas.width, canvas.height);

      // Track index tip x for swipe
      const indexTipX = lm[8][0];
      xHistory.current.push(indexTipX);
      if (xHistory.current.length > SWIPE_HISTORY_LEN) xHistory.current.shift();

      let gesture = classifyGesture(lm);

      // Swipe detection overrides point if fast horizontal motion
      if (xHistory.current.length === SWIPE_HISTORY_LEN && !swipeCooldown.current) {
        const delta = xHistory.current[0] - xHistory.current[SWIPE_HISTORY_LEN - 1];
        if (Math.abs(delta) > SWIPE_THRESH) {
          gesture = delta > 0 ? "swipe-left" : "swipe-right"; // mirrored view
          swipeCooldown.current = true;
          setTimeout(() => { swipeCooldown.current = false; xHistory.current = []; }, 800);
        }
      }

      if (gesture !== lastGesture.current || gesture === "swipe-left" || gesture === "swipe-right") {
        lastGesture.current = gesture;
        onGesture({
          gesture,
          landmarks: lm,
          tipX: 1 - lm[8][0],
          tipY: lm[8][1],
        });
      }
    },
    [onGesture, previewCanvasRef, videoRef]
  );

  useEffect(() => {
    if (!enabled) {
      // Stop stream tracks if any
      const stream = cameraRef.current as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
      cameraRef.current = null;
      return;
    }

    let mounted = true;
    let rafId = 0;

    const init = async () => {
      try {
        const { Hands } = await import("@mediapipe/hands");

        const hands = new Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.6,
        });

        hands.onResults(handleResults);
        await hands.initialize();

        if (!mounted) { hands.close(); return; }
        handsRef.current = hands;

        const video = videoRef.current;
        if (!video) return;

        // Use native getUserMedia — no @mediapipe/camera_utils needed
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
          audio: false,
        });

        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        cameraRef.current = stream;
        video.srcObject = stream;
        await video.play();

        const sendFrame = async () => {
          if (!mounted || !handsRef.current) return;
          if (video.readyState >= 2) {
            await handsRef.current.send({ image: video });
          }
          rafId = requestAnimationFrame(sendFrame);
        };
        rafId = requestAnimationFrame(sendFrame);
      } catch (err) {
        console.warn("MediaPipe / camera init failed:", err);
      }
    };

    init();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      const stream = cameraRef.current as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
      handsRef.current?.close();
      handsRef.current = null;
      cameraRef.current = null;
    };
  }, [enabled, handleResults, videoRef]);

  return null;
};
