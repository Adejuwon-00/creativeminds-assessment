import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SectionHeader } from "./SectionHeader";

describe("SectionHeader", () => {
  it("renders the title as a heading (h2 by default)", () => {
    render(<SectionHeader title="Today's sessions" />);
    expect(screen.getByRole("heading", { level: 2, name: "Today's sessions" })).toBeInTheDocument();
  });

  it("respects a custom heading level", () => {
    render(<SectionHeader title="Calendar" level={3} />);
    expect(screen.getByRole("heading", { level: 3, name: "Calendar" })).toBeInTheDocument();
  });

  it("renders the description when given", () => {
    render(<SectionHeader title="Today's sessions" description="Thursday, June 4 · 3 scheduled" />);
    expect(screen.getByText("Thursday, June 4 · 3 scheduled")).toBeInTheDocument();
  });

  it("renders the action as a link when href is given", () => {
    render(<SectionHeader title="Calendar" action={{ label: "Full calendar", href: "/calendar" }} />);
    expect(screen.getByRole("link", { name: /Full calendar/ })).toHaveAttribute("href", "/calendar");
  });

  it("renders the action as a button and fires onClick when only onClick is given", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SectionHeader title="Today's sessions" action={{ label: "View all", onClick }} />);
    const button = screen.getByRole("button", { name: /View all/ });
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("omits the action entirely when not given", () => {
    render(<SectionHeader title="Calendar" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("merges a caller-supplied className", () => {
    const { container } = render(<SectionHeader title="Calendar" className="custom-class" />);
    expect(container.firstElementChild?.className).toContain("custom-class");
  });
});
