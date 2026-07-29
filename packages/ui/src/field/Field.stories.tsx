import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../input/Input";
import { Field } from "./Field";

const meta = {
  title: "ui/Field",
  component: Field,
  parameters: { layout: "centered" },
  args: {
    label: "닉네임을 입력해주세요",
    hint: "(선택)",
    children: <Input placeholder="예: 민수" />,
  },
  render: (args) => (
    <div className="w-80">
      <Field {...args}>
        <Input placeholder="예: 민수" />
      </Field>
    </div>
  ),
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHelper: Story = {
  args: { helper: "비워두면 '회원님'으로 불러요" },
};
export const WithError: Story = {
  args: { error: "10자 이하로 입력해주세요" },
};
