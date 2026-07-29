import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card, CardBody, CardFooter, CardHeader } from "./Card";

const meta = {
  title: "ui/Card",
  component: Card,
  parameters: { layout: "centered" },
  argTypes: { elevated: { control: "boolean" } },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Composed: Story = {
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <h3 className="text-lg font-bold">셋업 안내</h3>
      </CardHeader>
      <CardBody>
        <p className="text-ink-soft text-base leading-relaxed">
          웹캠을 켜고 2m 물러선 뒤, 몸이 측면 45°로 보이게 서주세요.
        </p>
      </CardBody>
      <CardFooter>
        <span className="text-ink-muted text-sm">준비되면 시작하세요</span>
      </CardFooter>
    </Card>
  ),
};

export const Elevated: Story = { ...Composed, args: { elevated: true } };
