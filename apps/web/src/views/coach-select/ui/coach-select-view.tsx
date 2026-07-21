"use client";

import { useState } from "react";

import { Button } from "@/shared/ui/button";

import { COACHES } from "../model/coaches";
import { useCameraPermission } from "../model/use-camera-permission";
import { CoachCard } from "./coach-card";

/**
 * 랜딩 겸 캐릭터 선택 (PRD §4-1, F1-4).
 *
 * 읽고 → 고르고 → 준비하고 → 시작한다. 사용자가 이 흐름을 지나는 시간이 곧
 * 모델·오디오 프리로드 시간이 된다 (TRD-FE §9.1).
 */

/** 물리 셋업이 특이하다 — 카메라를 켜기 전에 알려야 한다 (PRD §4-1, F1-5) */
const SETUP = [
  {
    title: "카메라 설정",
    desc: "노트북을 책상에 두거나 스탠드에 올려 주세요. 흔들리지 않게요.",
  },
  {
    title: "거리 확보",
    desc: "전신이 화면에 들어오도록 약 2m 떨어져 주세요.",
  },
  {
    title: "각도 조절",
    desc: "무릎이 잘 보이도록 카메라와 45° 비스듬히 서 주세요.",
  },
];

const PROBLEM: Record<string, { title: string; body: string }> = {
  denied: {
    title: "카메라가 막혀 있어요",
    body: "주소창 왼쪽 자물쇠를 눌러 카메라를 허용한 뒤 다시 시작해 주세요.",
  },
  "no-camera": {
    title: "웹캠을 찾지 못했어요",
    body: "카메라가 연결돼 있는지 확인한 뒤 다시 시작해 주세요.",
  },
  unsupported: {
    title: "이 브라우저로는 어려워요",
    body: "크롬이나 엣지 최신 버전에서 열어 주세요.",
  },
};

export function CoachSelectView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { status, request } = useCameraPermission();

  const problem = PROBLEM[status];

  const handleStart = async () => {
    const ok = await request();
    if (ok) {
      // M2에서 /workout으로 이동. 지금은 파이프라인이 없어 라우팅하지 않는다.
    }
  };

  return (
    <main className="px-gutter py-16 lg:py-24">
      <div className="mx-auto max-w-4xl">
        {/* 히어로 */}
        <div className="text-center">
          <span className="bg-mint-100 text-mint-700 inline-block rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wider">
            코치 선택
          </span>
          <h1 className="mt-5 text-[clamp(1.875rem,3.6vw,2.75rem)] leading-[1.25] font-bold tracking-tight text-balance">
            당신의 폼을 완성할 <span className="text-mint-700">코치</span> 를
            선택해주세요
          </h1>
          <p className="text-ink-soft mx-auto mt-4 max-w-xl text-base leading-relaxed text-pretty">
            웹캠이 스쿼트 자세를 보고, 코치가 그 순간 바로 말해줍니다. 영상
            틀어놓고 혼자 따라 하는 게 아니라요.
          </p>
        </div>

        {/* 캐릭터 — 화면의 주인공 */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {COACHES.map((coach) => (
            <CoachCard
              key={coach.id}
              coach={coach}
              selected={selectedId === coach.id}
              onSelect={setSelectedId}
            />
          ))}
        </div>

        {/* 준비물 — 아무도 예상 못 하는 셋업이라 카메라 켜기 전에 */}
        <section className="mt-20">
          <h2 className="text-center text-xl font-bold tracking-tight">
            시작하기 전에
          </h2>
          <p className="text-ink-soft mt-2 text-center text-sm">
            이 셋이면 됩니다. 특별한 장비는 필요 없어요.
          </p>

          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {SETUP.map(({ title, desc }, i) => (
              <li
                key={title}
                className="border-line/70 bg-surface rounded-2xl border p-5"
              >
                {/* 아이콘 대신 번호를 시각 요소로 — 순서 자체가 정보다 */}
                <span className="text-mint-600/60 block text-3xl leading-none font-bold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-ink mt-3 text-[0.9375rem] font-bold">
                  {title}
                </h3>
                <p className="text-ink-soft mt-1.5 text-sm leading-relaxed">
                  {desc}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* 고지는 권한 요청 직전 = 시작 버튼 바로 위 (TRD-FE §8).
            PRD §10이 "방어이자 세일즈 포인트"라 했으므로 각주로 숨기지 않는다 */}
        <div className="mx-auto mt-16 max-w-xl text-center">
          <p className="text-mint-800 bg-mint-100 rounded-xl px-4 py-3 text-sm leading-relaxed">
            <strong className="font-semibold">
              영상은 기기 안에서만 처리됩니다.
            </strong>{" "}
            어디에도 저장하거나 보내지 않아요.
          </p>

          {problem && (
            <div
              role="alert"
              className="border-coach-clay/40 bg-coach-clay/8 mt-4 rounded-xl border px-4 py-3 text-left"
            >
              <p className="text-ink text-sm font-semibold">{problem.title}</p>
              <p className="text-ink-soft mt-1 text-sm leading-relaxed">
                {problem.body}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center gap-3">
            <Button
              onClick={handleStart}
              disabled={!selectedId || status === "requesting"}
              className="bg-mint-600 hover:bg-mint-700 w-full max-w-xs px-6 py-3.5 text-base"
            >
              {status === "requesting" ? "카메라 여는 중…" : "시작하기"}
            </Button>
            {!selectedId && (
              <span className="text-ink-soft text-sm">
                코치를 먼저 골라 주세요
              </span>
            )}
          </div>

          <p className="text-ink-soft/80 mt-10 text-xs leading-relaxed">
            의료·재활 목적이 아니에요. 통증이 있으면 멈추고 전문가와 상의하세요.
          </p>
        </div>
      </div>
    </main>
  );
}
