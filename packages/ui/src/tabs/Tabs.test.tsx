import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs } from "./Tabs";

function Fixture() {
  return (
    <Tabs defaultValue="a">
      <Tabs.List>
        <Tabs.Trigger value="a">A</Tabs.Trigger>
        <Tabs.Trigger value="b">B</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">내용A</Tabs.Content>
      <Tabs.Content value="b">내용B</Tabs.Content>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("shows the default panel only", () => {
    render(<Fixture />);
    expect(screen.getByText("내용A")).toBeInTheDocument();
    expect(screen.queryByText("내용B")).not.toBeInTheDocument();
  });

  it("switches panel on trigger click", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByText("내용B")).toBeInTheDocument();
    expect(screen.queryByText("내용A")).not.toBeInTheDocument();
  });

  it("moves with ArrowRight (activation follows focus)", async () => {
    render(<Fixture />);
    screen.getByRole("tab", { name: "A" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("내용B")).toBeInTheDocument();
  });

  it("uses roving tabindex (selected 0, others -1)", () => {
    render(<Fixture />);
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });
});
