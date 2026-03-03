import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TermsPrivacyPage from "@/app/terms-privacy/page";

describe("Terms & Privacy Policy page", () => {
  it("renders the page heading", () => {
    render(<TermsPrivacyPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Terms & Privacy Policy");
  });

  it("renders the last updated date", () => {
    render(<TermsPrivacyPage />);
    expect(screen.getByText("Last updated: February 2026")).toBeTruthy();
  });

  it("renders Terms of Service section", () => {
    render(<TermsPrivacyPage />);
    expect(screen.getByText("Terms of Service")).toBeTruthy();
    expect(screen.getByText("1. Acceptance of Terms")).toBeTruthy();
    expect(screen.getByText("2. Use of the Platform")).toBeTruthy();
    expect(screen.getByText("3. User Accounts")).toBeTruthy();
    expect(screen.getByText("4. Intellectual Property")).toBeTruthy();
    expect(screen.getByText("5. Termination")).toBeTruthy();
    expect(screen.getByText("6. Limitation of Liability")).toBeTruthy();
  });

  it("renders Privacy Policy section", () => {
    render(<TermsPrivacyPage />);
    expect(screen.getByText("Privacy Policy")).toBeTruthy();
    expect(screen.getByText("1. Information We Collect")).toBeTruthy();
    expect(screen.getByText("2. How We Use Your Information")).toBeTruthy();
    expect(screen.getByText("3. Data Storage & Security")).toBeTruthy();
    expect(screen.getByText("7. Contact Us")).toBeTruthy();
  });

  it("renders the BLLP-AI logo and Back to Home link", () => {
    render(<TermsPrivacyPage />);
    expect(screen.getByText("Back to Home")).toBeTruthy();
    expect(screen.getByText("BLLP")).toBeTruthy();
  });

  it("renders the copyright footer", () => {
    render(<TermsPrivacyPage />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} All rights reserved by BLLP-AI.`)
    ).toBeTruthy();
  });
});
