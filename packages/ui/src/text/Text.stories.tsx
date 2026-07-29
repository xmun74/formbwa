import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Heading, Text } from "./Text";

const meta = {
  title: "ui/Text",
  component: Text,
  parameters: { layout: "centered" },
  args: { children: "다람쥐 헌 쳇바퀴에 타고파" },
  argTypes: {
    tone: { control: "inline-radio", options: ["default", "soft", "muted"] },
  },
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Body: Story = {};
export const Muted: Story = { args: { tone: "muted", size: "sm" } };

export const Headings: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Heading level={1}>레벨 1 제목</Heading>
      <Heading level={2}>레벨 2 제목</Heading>
      <Heading level={3}>레벨 3 제목</Heading>
      <Text tone="soft">본문 텍스트예요.</Text>
    </div>
  ),
};
