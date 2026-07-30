import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading, Text } from "./Text";

describe("Text", () => {
  it("renders <p> by default", () => {
    render(<Text>안녕</Text>);
    expect(screen.getByText("안녕").tagName).toBe("P");
  });

  it("renders the element given by `as`", () => {
    render(<Text as="span">안녕</Text>);
    expect(screen.getByText("안녕").tagName).toBe("SPAN");
  });

  it("applies size/tone classes", () => {
    render(
      <Text size="lg" tone="muted">
        안녕
      </Text>,
    );
    expect(screen.getByText("안녕")).toHaveClass("text-lg", "text-ink-muted");
  });
});

describe("Heading", () => {
  it("renders a semantic heading for the level", () => {
    render(<Heading level={1}>제목</Heading>);
    expect(
      screen.getByRole("heading", { level: 1, name: "제목" }),
    ).toBeInTheDocument();
  });

  it("renders h3 for level 3", () => {
    render(<Heading level={3}>소제목</Heading>);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });

  it("maps default size to the level", () => {
    render(<Heading level={1}>제목</Heading>);
    expect(screen.getByText("제목")).toHaveClass("text-4xl");
  });
});
