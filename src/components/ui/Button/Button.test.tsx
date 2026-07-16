import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("defaults to variant=primary, size=md, and type=button", () => {
    render(<Button>Submit</Button>);
    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toHaveAttribute("type", "button");
    expect(button.className).toMatch(/primary/);
    expect(button.className).toMatch(/md/);
  });

  it.each(["primary", "gradient", "tonal", "secondary", "ghost"] as const)(
    "applies the %s variant class",
    (variant) => {
      render(
        <Button variant={variant} data-testid="btn">
          Label
        </Button>,
      );
      expect(screen.getByTestId("btn").className).toMatch(new RegExp(variant));
    },
  );

  it("respects an explicit type override", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute("type", "submit");
  });

  it("merges a caller-supplied className with its own", () => {
    render(<Button className="custom-class">Label</Button>);
    const button = screen.getByRole("button", { name: "Label" });
    expect(button.className).toContain("custom-class");
    expect(button.className).toMatch(/button/);
  });

  it("forwards a ref to the underlying <button> element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Label</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe("Label");
  });

  it("renders leading and trailing icons as decorative", () => {
    render(
      <Button leadingIcon={<svg data-testid="leading" />} trailingIcon={<svg data-testid="trailing" />}>
        Label
      </Button>,
    );
    const leading = screen.getByTestId("leading");
    const trailing = screen.getByTestId("trailing");
    expect(leading.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(trailing.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  describe("variant=icon", () => {
    it("uses aria-label as the accessible name and renders no visible text", () => {
      render(<Button variant="icon" aria-label="Delete item" leadingIcon={<svg data-testid="icon" />} />);
      const button = screen.getByRole("button", { name: "Delete item" });
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(button).not.toHaveTextContent(/./);
    });
  });

  describe("disabled state", () => {
    it("is marked disabled and does not fire onClick when clicked", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Label
        </Button>,
      );
      const button = screen.getByRole("button", { name: "Label" });
      expect(button).toBeDisabled();
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("sets aria-busy, disables the button, and shows a spinner instead of the leading icon", () => {
      render(
        <Button isLoading leadingIcon={<svg data-testid="leading" />}>
          Save
        </Button>,
      );
      const button = screen.getByRole("button", { name: "Save" });
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toBeDisabled();
      expect(screen.getByTestId("button-spinner")).toBeInTheDocument();
      expect(screen.queryByTestId("leading")).not.toBeInTheDocument();
    });

    it("does not fire onClick while loading", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button isLoading onClick={onClick}>
          Save
        </Button>,
      );
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("hides the trailing icon while loading", () => {
      render(
        <Button isLoading trailingIcon={<svg data-testid="trailing" />}>
          Save
        </Button>,
      );
      expect(screen.queryByTestId("trailing")).not.toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("fires onClick on mouse click", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Label</Button>);
      await user.click(screen.getByRole("button", { name: "Label" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("is reachable by keyboard and activates on Enter", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Label</Button>);
      await user.tab();
      expect(screen.getByRole("button", { name: "Label" })).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("activates on Space", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Label</Button>);
      await user.tab();
      await user.keyboard(" ");
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
