import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardBody, CardFooter, CardHeader } from "./Card";

describe("Card", () => {
  it("renders composed parts", () => {
    render(
      <Card>
        <CardHeader>헤더</CardHeader>
        <CardBody>본문</CardBody>
        <CardFooter>푸터</CardFooter>
      </Card>,
    );
    expect(screen.getByText("헤더")).toBeInTheDocument();
    expect(screen.getByText("본문")).toBeInTheDocument();
    expect(screen.getByText("푸터")).toBeInTheDocument();
  });

  it("applies base card classes on root", () => {
    render(<Card data-testid="card">x</Card>);
    expect(screen.getByTestId("card")).toHaveClass("rounded-2xl", "border");
  });

  it("elevated adds a shadow", () => {
    render(
      <Card data-testid="card" elevated>
        x
      </Card>,
    );
    expect(screen.getByTestId("card").className).toContain("shadow-");
  });

  it("merges consumer className (tv-merge)", () => {
    render(
      <Card data-testid="card" className="p-6">
        x
      </Card>,
    );
    expect(screen.getByTestId("card")).toHaveClass("p-6");
  });
});
