"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Field, Input } from "@repo/ui";
import { useWorkoutStore } from "@/entities/workout";
import { ROUTES } from "@/shared/config";
import { primeSpeech } from "@/shared/lib/speech";
import { AppShell } from "@/shared/ui/app-shell";
import { COACHES, DEFAULT_COACH, type Coach } from "../model/coaches";
import { SETUP_STEPS } from "../model/setup";
import { CoachCard } from "./CoachCard";

/**
 * `/start` 운동 준비 (PRD §4-3) — 닉네임(선택) + 코치 선택 + 셋업 안내.
 * "운동 시작"에서 닉네임·코치를 entities/workout에 쓰고 `/prepare`로 이동.
 */
export function WorkoutSetupView() {
  const [nickname, setNickname] = useState("");
  const [coachId, setCoachId] = useState<Coach["id"]>(DEFAULT_COACH.id);
  const setStoreNickname = useWorkoutStore((s) => s.setNickname);
  const setStoreCoach = useWorkoutStore((s) => s.setCoach);

  const commitAndStart = () => {
    setStoreNickname(nickname);
    const c = COACHES.find((x) => x.id === coachId) ?? DEFAULT_COACH;
    setStoreCoach({ id: c.id, name: c.name, emoji: c.emoji });
    primeSpeech(); // 이 클릭(제스처)에서 음성 자동재생 잠금 해제 → /workout 발화가 들리게
  };

  return (
    <AppShell>
      {/* 브레드크럼 */}
      <header className="border-line-soft flex h-15.5 items-center gap-3 border-b px-11 text-base">
        <Link
          href={ROUTES.ROUTINE}
          className="text-ink-muted hover:text-ink transition-colors"
        >
          ← 운동 목록
        </Link>
        <span className="text-line">/</span>
        <span className="text-ink font-bold">운동 준비</span>
      </header>

      <div className="mx-auto grid max-w-6xl items-start gap-12 px-gutter py-14 lg:grid-cols-[1.2fr_0.8fr]">
        {/* 좌: 폼 */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">운동 준비</h1>

          <Field label="닉네임을 입력해주세요" hint="(선택)" className="mt-8">
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 민수 (비워두면 '회원님'으로 불러요)"
              maxLength={10}
            />
          </Field>

          <div className="mt-7">
            <div className="text-base font-bold">코치를 골라주세요</div>
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
        </div>

        {/* 우: 셋업 안내 */}
        <aside className="border-line bg-surface rounded-2xl border p-7">
          <h2 className="text-lg font-bold">셋업 안내</h2>
          <ol className="mt-5 flex flex-col gap-5">
            {SETUP_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3.5">
                <span className="bg-brand-100 text-brand-700 grid size-7 shrink-0 place-items-center rounded-lg text-base font-bold">
                  {i + 1}
                </span>
                <div>
                  <div className="text-ink text-base font-bold">
                    {step.title}
                  </div>
                  <div className="text-ink-soft mt-1 text-base leading-relaxed">
                    {step.desc}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-ink-muted bg-canvas mt-6 rounded-xl px-4 py-3.5 text-sm leading-relaxed">
            카메라 영상은 기기 안에서만 처리되며 저장·전송되지 않습니다. 본
            서비스는 의료·재활 목적이 아니며, 무리가 되면 즉시 중단하세요.
          </p>

          <Button asChild size="lg" className="mt-8 w-full">
            <Link href={ROUTES.PREPARE} onClick={commitAndStart}>
              운동 시작
            </Link>
          </Button>
        </aside>
      </div>
    </AppShell>
  );
}
