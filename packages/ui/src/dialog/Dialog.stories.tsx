import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { buttonVariants } from "../button/Button";
import { Dialog } from "./Dialog";

const meta = {
  title: "ui/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

function ConfirmDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={buttonVariants()}>모달 열기</Dialog.Trigger>
      <Dialog.Content className="text-center">
        <Dialog.Title>운동을 그만둘까요?</Dialog.Title>
        <Dialog.Description>
          지금 나가면 이번 세트 기록이 사라져요.
        </Dialog.Description>
        <Dialog.Footer>
          <Dialog.Close className="border-line text-ink flex-1 rounded-xl border py-3 font-bold">
            계속하기
          </Dialog.Close>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="bg-brand-500 hover:bg-brand-600 flex-1 rounded-xl py-3 font-bold text-white"
          >
            그만두기
          </button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

export const Confirm: Story = {
  render: () => <ConfirmDemo />,
};
