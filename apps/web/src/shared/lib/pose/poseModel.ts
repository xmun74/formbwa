import type { PoseLandmarker } from "@mediapipe/tasks-vision";

/**
 * MediaPipe Pose 모델 로더 — 인메모리 싱글턴 (TRD-FE §3.2·§9.1).
 * 도메인이 아니라 리소스라 entities가 아닌 shared/lib에 둔다.
 * `/` 인트로에서 프리로드 시작 → 라우트가 바뀌어도 모듈 캐시로 유지.
 * 새로고침 시엔 다시 프리로드(재다운로드 캐시 성격).
 *
 * `@mediapipe/tasks-vision`은 WASM·DOM에 의존하므로 반드시 클라이언트에서 dynamic import.
 */
const WASM_ROOT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

let modelPromise: Promise<PoseLandmarker> | null = null;

async function createLandmarker(): Promise<PoseLandmarker> {
  const { FilesetResolver, PoseLandmarker } =
    await import("@mediapipe/tasks-vision");
  const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    runningMode: "VIDEO",
    numPoses: 1,
  });
}

/** 모델 프리로드 시작(또는 진행 중/완료된 프라미스 반환). 여러 번 불러도 1회만 로드. */
export function preloadPoseModel(): Promise<PoseLandmarker> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("pose model은 클라이언트에서만 로드"));
  }
  modelPromise ??= createLandmarker().catch((e) => {
    modelPromise = null; // 실패 시 다음 시도에서 재로드
    throw e;
  });
  return modelPromise;
}
