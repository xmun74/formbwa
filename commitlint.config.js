// scope 목록 — commitlint 검사(scope-enum)와 cz-git 프롬프트 선택지가 공유하는 단일 소스.
const scopes = [
  "web",
  "be",
  "core",
  "ui",
  "tokens",
  "config",
  "repo",
  "coach-assets",
];

/** @type {import("@commitlint/types").UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // 대문자 약어(FSD·ROUTES·GA4 등)를 주제에 허용
    "subject-case": [0],
    // scope는 생략 가능하되, 쓸 거면 위 목록 안에서만 (오타·임의 scope 차단)
    "scope-enum": [2, "always", scopes],
  },
  // cz-git 프롬프트 설정 — `pnpm commit`(git cz)에서 type·scope를 화살표로 선택
  prompt: {
    alias: { fd: "docs: fix typos" },
    messages: {
      type: "커밋 유형을 선택하세요:",
      scope: "변경 범위(scope)를 선택하세요 (생략 가능):",
      customScope: "변경 범위를 직접 입력하세요:",
      subject: "변경 내용을 간결하게 적으세요:\n",
      body: '상세 설명 (선택). "|"로 줄바꿈:\n',
      breaking: "breaking changes (선택):\n",
      footerPrefixesSelect: "관련 이슈 유형 (선택):",
      customFooterPrefix: "이슈 prefix 입력:",
      footer: "관련 이슈 (선택). 예: #31, #34:\n",
      confirmCommit: "위 내용으로 커밋할까요?",
    },
    // scope 선택지 = commitlint scope-enum과 동일 목록 (단일 소스)
    scopes,
    // scope 생략 허용: 빈 선택(엔터)으로 넘어갈 수 있음
    allowEmptyScopes: true,
    allowCustomScopes: false,
    types: [
      { value: "feat", name: "feat:     새 기능" },
      { value: "fix", name: "fix:      버그 수정" },
      { value: "docs", name: "docs:     문서 변경" },
      { value: "style", name: "style:    스타일링 (기능 변화 없음)" },
      { value: "refactor", name: "refactor: 리팩터링" },
      { value: "perf", name: "perf:     성능 개선" },
      { value: "test", name: "test:     테스트" },
      { value: "build", name: "build:    빌드 시스템/의존성" },
      { value: "ci", name: "ci:       CI 설정" },
      { value: "chore", name: "chore:    설정 변경 (기능과 무관)" },
      { value: "revert", name: "revert:   커밋 되돌리기" },
    ],
  },
};
