import type { Preview } from "@storybook/react-vite";
// 폰트, Tailwind 토큰 적용
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

const preview: Preview = {
  // 전 컴포넌트 자동 Docs 페이지. 합성 4종은 별도 MDX가 대체.
  tags: ["autodocs"],
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: { test: "todo" },
  },
  decorators: [
    (Story) => (
      <div className="font-sans">
        <Story />
      </div>
    ),
  ],
};

export default preview;
