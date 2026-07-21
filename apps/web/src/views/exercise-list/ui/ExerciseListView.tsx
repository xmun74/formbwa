"use client";

import Link from "next/link";
import { useState } from "react";

import { buttonClass } from "@/shared/ui/button";

import {
  ALL_EXERCISES,
  DEFAULT_EXERCISE,
  EXERCISE_CATEGORIES,
} from "../model/exercises";
import { ExerciseCard } from "./ExerciseCard";

/**
 * `/exercises` 운동 목록 (PRD §4-2) — 부위별 종목 그리드.
 * 종목을 고르면 우하단 플로팅 버튼이 "{종목}로 시작하기"로 바뀌고 `/start`로 이동.
 * 지금은 스쿼트만 선택 가능.
 */
export function ExerciseListView() {
  const [selectedId, setSelectedId] = useState(DEFAULT_EXERCISE.id);
  const selected =
    ALL_EXERCISES.find((e) => e.id === selectedId) ?? DEFAULT_EXERCISE;

  return (
    <main className="min-h-screen px-gutter pt-14 pb-32">
      <div className="max-w-4xl">
        <h1 className="text-[30px] font-extrabold tracking-tight">운동 목록</h1>
        <p className="text-ink-soft mt-2 text-[15px]">
          부위를 골라 종목을 선택하세요. 지금은{" "}
          <b className="text-brand-700 font-bold">스쿼트</b>부터 시작할 수
          있어요.
        </p>

        <div className="mt-10 flex flex-col gap-9">
          {EXERCISE_CATEGORIES.map((cat) => (
            <section key={cat.id}>
              <h2 className="mb-3.5 flex items-baseline gap-2">
                <span className="text-ink text-[15px] font-bold">
                  {cat.name}
                </span>
                {cat.note && (
                  <span className="text-ink-muted text-[13px]">{cat.note}</span>
                )}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {cat.exercises.map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    selected={ex.id === selectedId}
                    onSelect={setSelectedId}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* 우하단 플로팅 시작 버튼 */}
      <div className="fixed right-8 bottom-8 z-10">
        <Link
          href="/start"
          className={buttonClass(
            "primary",
            "px-7 py-4 text-[16px] shadow-[0_16px_34px_-14px] shadow-brand-500/70",
          )}
        >
          {selected.name}로 시작하기 →
        </Link>
      </div>
    </main>
  );
}
