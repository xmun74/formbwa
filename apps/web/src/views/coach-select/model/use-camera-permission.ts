"use client";

import { useCallback, useState } from "react";

/**
 * 카메라 권한을 랜딩에서 미리 받는다 (TRD-FE §9.1).
 *
 * /workout에서 받으면 거부·웹캠 없음일 때 빈 운동 화면이 뜬 채로 안내해야 한다.
 * 여기서 게이트로 잡으면 통과한 사람만 넘어간다. 권한은 오리진 단위로 브라우저가
 * 기억하므로 /workout의 getUserMedia는 프롬프트 없이 통과한다.
 */
export type CameraStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "no-camera"
  | "unsupported";

export function useCameraPermission() {
  const [status, setStatus] = useState<CameraStatus>("idle");

  const request = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setStatus("unsupported");
      return false;
    }

    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // 권한 확인이 목적이므로 즉시 끈다. 카메라 표시등이 켜진 채 랜딩에 머물지 않게.
      stream.getTracks().forEach((track) => track.stop());
      setStatus("granted");
      return true;
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      setStatus(
        name === "NotFoundError" || name === "OverconstrainedError"
          ? "no-camera"
          : "denied",
      );
      return false;
    }
  }, []);

  return { status, request };
}
