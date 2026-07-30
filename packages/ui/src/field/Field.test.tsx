import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "../input/Input";
import { Field } from "./Field";

describe("Field", () => {
  it("associates the label with the control", () => {
    render(
      <Field label="닉네임">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("닉네임")).toBeInstanceOf(HTMLInputElement);
  });

  it("links helper text via aria-describedby (no invalid)", () => {
    render(
      <Field label="닉네임" helper="도움말">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("닉네임");
    const descId = input.getAttribute("aria-describedby");
    expect(descId).toBeTruthy();
    expect(document.getElementById(descId!)).toHaveTextContent("도움말");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("sets aria-invalid and links error text", () => {
    render(
      <Field label="닉네임" error="10자 이하로 입력해주세요">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("닉네임");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const descId = input.getAttribute("aria-describedby");
    expect(document.getElementById(descId!)).toHaveTextContent(
      "10자 이하로 입력해주세요",
    );
  });
});
