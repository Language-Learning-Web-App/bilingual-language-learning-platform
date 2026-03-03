import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CTASection } from "@/components/landing/cta-section";

describe("CTASection component", () => {
  it("renders the CTA heading", () => {
    render(<CTASection />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toContain("Ready to start your");
    expect(heading.textContent).toContain("language journey?");
  });

  it("renders the Get Started button", () => {
    render(<CTASection />);
    expect(screen.getByText("Get Started")).toBeTruthy();
  });

  it("renders the description text", () => {
    render(<CTASection />);
    expect(screen.getByText(/Join millions of learners worldwide/)).toBeTruthy();
  });

  it("Get Started links to sign-up page", () => {
    render(<CTASection />);
    const link = screen.getByText("Get Started").closest("a");
    expect(link?.getAttribute("href")).toBe("/sign-up");
  });

  it("renders decorative emoji elements", () => {
    render(<CTASection />);
    expect(screen.getByText("🌍")).toBeTruthy();
    expect(screen.getByText("💬")).toBeTruthy();
  });
});
