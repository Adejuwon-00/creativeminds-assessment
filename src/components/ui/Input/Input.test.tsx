import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("associates the label with the field via htmlFor/id", () => {
    render(<Input label="Email address" />);
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("visually hides the label while keeping it in the accessibility tree", () => {
    render(<Input label="Search" hideLabel />);
    const label = screen.getByText("Search");
    expect(label.className).toMatch(/visuallyHidden/);
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
  });

  it("respects a caller-supplied id instead of generating one", () => {
    render(<Input label="Email" id="email-field" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email-field");
  });

  it("shows helper text and associates it via aria-describedby", () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />);
    const input = screen.getByLabelText("Password");
    const helperId = input.getAttribute("aria-describedby");
    expect(helperId).toBeTruthy();
    expect(document.getElementById(helperId!)).toHaveTextContent("Must be at least 8 characters");
  });

  it("has no aria-describedby when there is no helper or error text", () => {
    render(<Input label="Name" />);
    expect(screen.getByLabelText("Name")).not.toHaveAttribute("aria-describedby");
  });

  describe("error state", () => {
    it("marks the input invalid and shows the error message instead of helper text", () => {
      render(
        <Input
          label="Email"
          helperText="We'll never share your email"
          error
          errorMessage="Enter a valid email address"
        />,
      );
      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
      expect(screen.queryByText("We'll never share your email")).not.toBeInTheDocument();
    });

    it("falls back to helper text when error is true but no errorMessage is given", () => {
      render(<Input label="Email" helperText="We'll never share your email" error />);
      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    });
  });

  it("disables the field", () => {
    render(<Input label="Name" disabled />);
    expect(screen.getByLabelText("Name")).toBeDisabled();
  });

  it("renders prefix and suffix content", () => {
    render(<Input label="Amount" prefix={<span>$</span>} suffix={<span>USD</span>} />);
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("fires onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Name" onChange={onChange} />);
    await user.type(screen.getByLabelText("Name"), "Jo");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("forwards a ref to the underlying <input>", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input label="Name" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("merges a caller-supplied className on the root", () => {
    const { container } = render(<Input label="Name" className="custom-class" />);
    expect(container.firstElementChild?.className).toContain("custom-class");
  });
});
