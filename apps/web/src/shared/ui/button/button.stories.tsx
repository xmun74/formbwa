import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";

const meta = {
  title: "shared/ui/Button",
  component: Button,
  parameters: { layout: "centered" },
  args: { children: "세트 시작" },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Disabled: Story = {
  args: { disabled: true },
};
