import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tabs } from "./Tabs";

const meta = {
  title: "ui/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="squat" className="w-96">
      <Tabs.List>
        <Tabs.Trigger value="squat">스쿼트</Tabs.Trigger>
        <Tabs.Trigger value="pushup">푸시업</Tabs.Trigger>
        <Tabs.Trigger value="lunge">런지</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="squat" className="text-ink-soft text-base">
        하체 기본 — 무릎/허리 각도를 실시간으로 봐줍니다.
      </Tabs.Content>
      <Tabs.Content value="pushup" className="text-ink-soft text-base">
        상체 — 준비 중.
      </Tabs.Content>
      <Tabs.Content value="lunge" className="text-ink-soft text-base">
        하체 — 준비 중.
      </Tabs.Content>
    </Tabs>
  ),
};
