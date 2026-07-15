import type { Preview } from "@storybook/nextjs-vite";

// layout.tsx가 아니라 여기서 로드해야 스토리에 Tailwind·폰트가 적용된다
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
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
