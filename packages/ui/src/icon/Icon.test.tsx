import { render, screen } from "@testing-library/react";
import type { SVGProps } from "react";
import { describe, expect, it } from "vitest";
import { Icon } from "./Icon";

function TestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg data-testid="svg" {...props}>
      <path d="M0 0" />
    </svg>
  );
}

describe("Icon", () => {
  it("meaningful icon exposes role=img + aria-label", () => {
    render(<Icon icon={TestIcon} label="완료" />);
    const el = screen.getByRole("img", { name: "완료" });
    expect(el).not.toHaveAttribute("aria-hidden");
  });

  it("decorative icon (no label) is aria-hidden with no role", () => {
    render(<Icon icon={TestIcon} />);
    const el = screen.getByTestId("svg");
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).not.toHaveAttribute("role");
  });

  it("applies the size token class", () => {
    render(<Icon icon={TestIcon} size="lg" />);
    expect(screen.getByTestId("svg")).toHaveClass("size-6");
  });
});
