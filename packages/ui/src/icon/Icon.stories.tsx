import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { SVGProps } from "react";
import { Icon } from "./Icon";

// 데모용 인라인 SVG (라이브러리 의존 없이) — 실제로는 lucide 등을 넘긴다.
function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const meta = {
  title: "ui/Icon",
  component: Icon,
  parameters: { layout: "centered" },
  args: { icon: CheckIcon, label: "완료" },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="text-brand-500 flex items-center gap-4">
      <Icon icon={CheckIcon} size="sm" label="작게" />
      <Icon icon={CheckIcon} size="md" label="중간" />
      <Icon icon={CheckIcon} size="lg" label="크게" />
    </div>
  ),
};
