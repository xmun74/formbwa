import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>세트 시작</Button>);
    await userEvent.click(screen.getByRole("button", { name: "세트 시작" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("applies size variant classes", () => {
    render(
      <Button variant="ghost" size="lg">
        x
      </Button>,
    );
    expect(screen.getByRole("button").className).toContain("text-lg");
  });

  it("asChild renders the child element with button styles merged", () => {
    render(
      <Button asChild>
        <a href="/x">가기</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "가기" });
    expect(link).toHaveAttribute("href", "/x");
    expect(link.className).toContain("rounded-xl"); // 버튼 base가 링크에 병합됨
  });

  it("is disabled", () => {
    render(<Button disabled>x</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
