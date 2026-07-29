import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 클래스 병합 유틸 — clsx(조건부 조합) + tailwind-merge(충돌 해결).
 * tailwind-variants가 컴포넌트 내부 병합은 자동 처리하므로, 이건 **tv 밖**
 * (뷰의 조건부 클래스, `className` override 병합)에서 쓴다.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
