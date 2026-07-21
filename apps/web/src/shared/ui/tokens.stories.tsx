import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";

/**
 * 디자인 토큰 문서 — `globals.css`의 `@theme`를 그대로 비춘다.
 *
 * 값을 하드코딩하지 않고 실제 CSS 변수를 런타임에 읽는다. 하드코딩하면
 * globals.css를 고칠 때마다 문서가 어긋나고, 어긋난 문서는 없느니만 못하다.
 */

interface Token {
  name: string;
  variable: string;
  value: string;
  hex: string;
}

/** CSS 색을 실제로 렌더해 hex를 얻는다 — oklch()/lab() 문자열 파싱을 피한다 */
function toHex(color: string): string {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const ctx = cv.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return (
    "#" + [r, g, b].map((v) => (v ?? 0).toString(16).padStart(2, "0")).join("")
  );
}

function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const [r, g, b] = channels.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (hi! + 0.05) / (lo! + 0.05);
}

const GROUPS: { title: string; note: string; names: string[] }[] = [
  {
    title: "브랜드 — 티파니 민트",
    note: "#81D8D0 = mint-300. 검정 섞기 대신 OKLCH로 굴려 중간톤 채도를 유지했다. 배경·배지는 50~300, 버튼은 600(흰 글씨 4.7), 텍스트는 700~900.",
    names: [
      "mint-50",
      "mint-100",
      "mint-200",
      "mint-300",
      "mint-400",
      "mint-500",
      "mint-600",
      "mint-700",
      "mint-800",
      "mint-900",
      "mint-950",
    ],
  },
  {
    title: "뉴트럴",
    note: "순수 흑백을 쓰지 않는다. 전부 민트 색상환(h≈188)으로 틴트해 배경이 브랜드와 겉돌지 않게 한다.",
    names: ["canvas", "surface", "line", "ink-soft", "ink"],
  },
  {
    title: "캐릭터 액센트",
    note: "민트의 보색 쪽. 채도를 억제해 헬스장 형광을 피한다. deep은 솔리드 말풍선의 흰 글씨용.",
    names: ["coach-warm", "coach-warm-deep", "coach-clay", "coach-clay-deep"],
  },
];

function useTokens(names: string[]): Token[] {
  const [tokens, setTokens] = useState<Token[]>([]);
  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    setTokens(
      names.map((name) => {
        const variable = `--color-${name}`;
        const value = root.getPropertyValue(variable).trim();
        return { name, variable, value, hex: toHex(value) };
      }),
    );
  }, [names]);
  return tokens;
}

function Swatch({ token }: { token: Token }) {
  const onWhite = contrast(token.hex, "#ffffff");
  const onInk = contrast(token.hex, "#182a29");
  return (
    <div className="border-line/70 bg-surface flex items-center gap-4 rounded-xl border p-3">
      <div
        className="border-line/50 size-14 shrink-0 rounded-lg border"
        style={{ background: token.value }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-ink font-mono text-sm font-semibold">
          {token.name}
        </div>
        <div className="text-ink-soft mt-0.5 truncate font-mono text-xs">
          {token.value}
        </div>
        <div className="text-ink-soft/80 mt-0.5 font-mono text-xs">
          {token.hex}
        </div>
      </div>
      <div className="text-ink-soft shrink-0 text-right font-mono text-[0.6875rem] leading-relaxed">
        <div>흰글씨 {onWhite.toFixed(1)}</div>
        <div>ink 위 {onInk.toFixed(1)}</div>
      </div>
    </div>
  );
}

function Group({ title, note, names }: (typeof GROUPS)[number]) {
  const tokens = useTokens(names);
  return (
    <section className="mb-10">
      <h2 className="text-ink text-lg font-bold">{title}</h2>
      <p className="text-ink-soft mt-1 mb-4 max-w-2xl text-sm leading-relaxed">
        {note}
      </p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {tokens.map((t) => (
          <Swatch key={t.name} token={t} />
        ))}
      </div>
    </section>
  );
}

function Tokens() {
  return (
    <div className="bg-canvas min-h-screen p-8">
      <h1 className="text-ink text-2xl font-bold">디자인 토큰</h1>
      <p className="text-ink-soft mt-2 mb-8 max-w-2xl text-sm leading-relaxed">
        <code className="font-mono">globals.css</code>의{" "}
        <code className="font-mono">@theme</code> 값을 런타임에 읽어 그린다 — 이
        페이지는 항상 실제 코드와 일치한다.
      </p>
      {GROUPS.map((g) => (
        <Group key={g.title} {...g} />
      ))}
    </div>
  );
}

const meta = {
  title: "shared/Design Tokens",
  component: Tokens,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Tokens>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Colors: Story = {};
