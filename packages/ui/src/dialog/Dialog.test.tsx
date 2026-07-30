import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Dialog } from "./Dialog";

function Fixture() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>열기</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>제목</Dialog.Title>
        <Dialog.Description>설명</Dialog.Description>
        <Dialog.Footer>
          <Dialog.Close>닫기</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens via trigger and closes via close button", async () => {
    render(<Fixture />);
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(dialog).not.toHaveAttribute("open");

    await userEvent.click(screen.getByRole("button", { name: "열기" }));
    expect(dialog).toHaveAttribute("open");

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(dialog).not.toHaveAttribute("open");
  });

  it("wires aria-labelledby/describedby to title/description", () => {
    render(<Fixture />);
    const dialog = screen.getByRole("dialog", { hidden: true });
    const labelledby = dialog.getAttribute("aria-labelledby");
    const describedby = dialog.getAttribute("aria-describedby");
    expect(document.getElementById(labelledby!)).toHaveTextContent("제목");
    expect(document.getElementById(describedby!)).toHaveTextContent("설명");
  });
});
