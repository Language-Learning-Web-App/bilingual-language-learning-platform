import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/landing/hero";

describe("Hero component", () => {
  it("renders the main heading", () => {
    render(<Hero />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeTruthy();
    expect(heading.textContent).toContain("Learn Languages");
    expect(heading.textContent).toContain("Confidence");
  });

  it("renders the AI-Powered Learning badge", () => {
    render(<Hero />);
    expect(screen.getByText("AI-Powered Learning")).toBeTruthy();
  });

  it("renders Sign Up call-to-action button", () => {
    render(<Hero />);
    expect(screen.getAllByText("Sign Up").length).toBeGreaterThan(0);
  });

  it("renders the View Languages button", () => {
    render(<Hero />);
    expect(screen.getByText("View Languages")).toBeTruthy();
  });

  it("displays the Arabic progress card", () => {
    render(<Hero />);
    expect(screen.getByText("Arabic")).toBeTruthy();
    expect(screen.getByText("78%")).toBeTruthy();
    expect(screen.getByText("Intermediate")).toBeTruthy();
  });

  it("renders floating language glyphs", () => {
    render(<Hero />);
    expect(screen.getByText("你好")).toBeTruthy();
    expect(screen.getByText("Bonjour")).toBeTruthy();
    expect(screen.getByText("Hola")).toBeTruthy();
  });
});
