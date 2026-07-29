import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "ui/Button",
  component: Button,
  parameters: { layout: "centered" },
  args: { children: "세트 시작" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost"],
    },
    size: { control: "inline-radio", options: ["md", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Large: Story = { args: { size: "lg" } };
export const Disabled: Story = { args: { disabled: true } };
