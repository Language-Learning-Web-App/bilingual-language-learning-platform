import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Features } from "@/components/landing/features";

describe("Features component", () => {
  it("renders the section heading", () => {
    render(<Features />);
    expect(screen.getByText("Why BLLP-AI")).toBeTruthy();
    expect(screen.getByText("reimagined")).toBeTruthy();
  });

  it("renders all four feature cards", () => {
    render(<Features />);
    expect(screen.getByText("Adaptive AI Tutor")).toBeTruthy();
    expect(screen.getByText("Immersive Audio")).toBeTruthy();
    expect(screen.getByText("Smart Analytics")).toBeTruthy();
    expect(screen.getByText("30+ Languages")).toBeTruthy();
  });

  it("renders feature descriptions", () => {
    render(<Features />);
    expect(
      screen.getByText(/Lessons that adjust in real-time/)
    ).toBeTruthy();
    expect(
      screen.getByText(/Native speaker recordings/)
    ).toBeTruthy();
  });

  it("has the correct section id for anchor navigation", () => {
    const { container } = render(<Features />);
    const section = container.querySelector("#features");
    expect(section).toBeTruthy();
  });
});
