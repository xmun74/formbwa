"use client";

import Link from "next/link";
import { useState } from "react";

import { buttonClass } from "@/shared/ui/button";
import { AppShell } from "@/shared/ui/app-shell";

import { COACHES, DEFAULT_COACH, type Coach } from "../model/coaches";
import { SETUP_STEPS } from "../model/setup";
import { CoachCard } from "./CoachCard";

// TODO(M2): 선택 종목·닉네임·코치를 entities/session store로 옮겨 /workout까지 넘긴다.
const EXERCISE_NAME = "스쿼트";

/**
 * `/start` 운동 준비 (PRD §4-3) — 닉네임(선택) + 코치 선택 + 셋업 안내.
 * "운동 시작" → `/workout` (거기서 카메라 권한·자세 배치).
 */
export function WorkoutSetupView() {
  const [nickname, setNickname] = useState("");
  const [coachId, setCoachId] = useState<Coach["id"]>(DEFAULT_COACH.id);

  return (
    <AppShell>
      {/* 브레드크럼 */}
      <header className="border-line-soft flex h-[62px] items-center gap-3 border-b px-11 text-[15px]">
        <Link
          href="/exercises"
          className="text-ink-muted hover:text-ink transition-colors"
        >
          ← 운동 목록
        </Link>
        <span className="text-line">/</span>
        <span className="text-ink font-bold">{EXERCISE_NAME} · 운동 준비</span>
      </header>

      <div className="mx-auto grid max-w-6xl items-start gap-12 px-gutter py-14 lg:grid-cols-[1.1fr_0.9fr]">
        {/* 좌: 폼 */}
        <div>
          <h1 className="text-[30px] font-extrabold tracking-tight">
            운동 준비
          </h1>

          <label className="mt-8 block">
            <span className="text-[15px] font-bold">
              뭐라고 부를까요?{" "}
              <span className="text-ink-muted font-normal">(선택)</span>
            </span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 민수 — 비워두면 '회원님'으로 불러요"
              maxLength={20}
              className="border-line focus:border-brand-400 bg-surface placeholder:text-ink-muted mt-2.5 w-full rounded-xl border px-4 py-3.5 text-[15px] outline-none transition-colors"
            />
          </label>

          <div className="mt-7">
            <div className="text-[15px] font-bold">코치를 골라주세요</div>
            <div className="mt-3 grid grid-cols-2 gap-3.5">
              {COACHES.map((c) => (
                <CoachCard
                  key={c.id}
                  coach={c}
                  selected={c.id === coachId}
                  onSelect={setCoachId}
                />
              ))}
            </div>
          </div>

          <Link
            href="/prepare"
            className={buttonClass("primary", "mt-8 w-full py-4 text-[16px]")}
          >
            운동 시작
          </Link>
        </div>

        {/* 우: 셋업 안내 */}
        <aside className="border-line bg-surface rounded-2xl border p-7">
          <h2 className="text-[17px] font-bold">셋업 안내</h2>
          <ol className="mt-5 flex flex-col gap-5">
            {SETUP_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3.5">
                <span className="bg-brand-100 text-brand-700 grid size-7 shrink-0 place-items-center rounded-lg text-[14px] font-bold">
                  {i + 1}
                </span>
                <div>
                  <div className="text-ink text-[15px] font-bold">
                    {step.title}
                  </div>
                  <div className="text-ink-soft mt-1 text-[14px] leading-relaxed">
                    {step.desc}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-ink-muted bg-canvas mt-6 rounded-xl px-4 py-3.5 text-[13px] leading-relaxed">
            카메라 영상은 기기 안에서만 처리되며 저장·전송되지 않습니다. 본
            서비스는 의료·재활 목적이 아니며, 무리가 되면 즉시 중단하세요.
          </p>
        </aside>
      </div>
    </AppShell>
  );
}
