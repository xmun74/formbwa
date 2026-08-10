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
let instance: PoseLandmarker | null = null; // 동기 close용 (dispose가 즉시 접근)

async function createLandmarker(): Promise<PoseLandmarker> {
  const { FilesetResolver, PoseLandmarker } =
    await import("@mediapipe/tasks-vision");
  const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
  const lm = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    runningMode: "VIDEO",
    numPoses: 1,
  });
  instance = lm;
  return lm;
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

/**
 * 모델을 해제하고 WebGL 컨텍스트를 반환한다. **새로고침·페이지 이탈(pagehide) 시 호출.**
 * 안 하면 GPU 컨텍스트가 새로고침마다 누적돼 브라우저 한계 초과로 점점 느려진다.
 * 라우트 전환에는 부르지 않는다(§9.1 — 모델은 라우트 전환에 유지).
 */
export function disposePoseModel(): void {
  instance?.close(); // 동기 — WebGL 컨텍스트 즉시 반환
  instance = null;
  modelPromise = null;
}
