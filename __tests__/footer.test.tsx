import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/landing/footer";

describe("Footer component", () => {
  it("renders the BLLP-AI brand", () => {
    render(<Footer />);
    expect(screen.getByText("BLLP")).toBeTruthy();
    expect(screen.getByText("-AI")).toBeTruthy();
  });

  it("renders all footer navigation links", () => {
    render(<Footer />);
    expect(screen.getByText("Features")).toBeTruthy();
    expect(screen.getByText("Languages")).toBeTruthy();
    expect(screen.getByText("Terms & Privacy Policy")).toBeTruthy();
  });

  it("displays the copyright with current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} All rights reserved by BLLP-AI.`)
    ).toBeTruthy();
  });

  it("Terms & Privacy Policy links to the correct page", () => {
    render(<Footer />);
    const link = screen.getByText("Terms & Privacy Policy");
    expect(link.closest("a")?.getAttribute("href")).toBe("/terms-privacy");
  });
});
