import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta = {
  title: "ui/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  args: { children: "준비 중" },
  argTypes: {
    tone: { control: "inline-radio", options: ["neutral", "brand"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Neutral: Story = { args: { tone: "neutral" } };
export const Brand: Story = { args: { tone: "brand", children: "지금 가능" } };
