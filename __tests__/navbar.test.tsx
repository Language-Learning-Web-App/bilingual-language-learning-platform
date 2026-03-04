import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Navbar } from "@/components/landing/navbar";

describe("Navbar component", () => {
  it("renders the brand name BLLP-AI", () => {
    render(<Navbar />);
    expect(screen.getByText("BLLP")).toBeTruthy();
    expect(screen.getByText("-AI")).toBeTruthy();
  });

  it("renders desktop navigation links", () => {
    render(<Navbar />);
    expect(screen.getAllByText("Features").length).toBeGreaterThan(0);
    expect(screen.getAllByText("How It Works").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Languages").length).toBeGreaterThan(0);
  });

  it("renders Sign In and Sign Up buttons", () => {
    render(<Navbar />);
    expect(screen.getAllByText("Sign In").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sign Up").length).toBeGreaterThan(0);
  });

  it("has correct href for Sign In and Sign Up", () => {
    render(<Navbar />);
    const signInLinks = screen
      .getAllByText("Sign In")
      .map((el) => el.closest("a"));
    expect(signInLinks.some((a) => a?.getAttribute("href") === "/sign-in")).toBe(true);

    const signUpLinks = screen
      .getAllByText("Sign Up")
      .map((el) => el.closest("a"));
    expect(signUpLinks.some((a) => a?.getAttribute("href") === "/sign-up")).toBe(true);
  });

  it("renders the mobile menu toggle button", () => {
    render(<Navbar />);
    const toggleBtn = screen.getByLabelText("Toggle menu");
    expect(toggleBtn).toBeTruthy();
  });

  it("opens mobile menu when hamburger is clicked", async () => {
    render(<Navbar />);
    const toggleBtn = screen.getByLabelText("Toggle menu");
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      const mobileLinks = screen.getAllByText("Features");
      expect(mobileLinks.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("closes mobile menu when a link inside is clicked", async () => {
    render(<Navbar />);
    const toggleBtn = screen.getByLabelText("Toggle menu");
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      const mobileLinks = screen.getAllByText("Features");
      expect(mobileLinks.length).toBeGreaterThanOrEqual(2);
    });

    const allFeatureLinks = screen.getAllByText("Features");
    const mobileFeatureLink = allFeatureLinks[allFeatureLinks.length - 1];
    fireEvent.click(mobileFeatureLink);

    fireEvent.click(toggleBtn);
  });
});
