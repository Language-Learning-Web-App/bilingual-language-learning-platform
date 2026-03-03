import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import Page from "@/app/page";

vi.mock("@/components/landing/navbar", () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));
vi.mock("@/components/landing/hero", () => ({
  Hero: () => <section data-testid="hero">Hero</section>,
}));
vi.mock("@/components/landing/features", () => ({
  Features: () => <section data-testid="features">Features</section>,
}));
vi.mock("@/components/landing/how-it-works", () => ({
  HowItWorks: () => <section data-testid="how-it-works">HowItWorks</section>,
}));
vi.mock("@/components/landing/languages-marquee", () => ({
  LanguagesMarquee: () => <section data-testid="languages-marquee">LanguagesMarquee</section>,
}));
vi.mock("@/components/landing/cta-section", () => ({
  CTASection: () => <section data-testid="cta-section">CTASection</section>,
}));
vi.mock("@/components/landing/footer", () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe("Landing page (app/page.tsx)", () => {
  it("renders all sections in order", () => {
    const { getByTestId } = render(<Page />);
    expect(getByTestId("navbar")).toBeTruthy();
    expect(getByTestId("hero")).toBeTruthy();
    expect(getByTestId("features")).toBeTruthy();
    expect(getByTestId("how-it-works")).toBeTruthy();
    expect(getByTestId("languages-marquee")).toBeTruthy();
    expect(getByTestId("cta-section")).toBeTruthy();
    expect(getByTestId("footer")).toBeTruthy();
  });

  it("wraps everything in a main element", () => {
    const { container } = render(<Page />);
    const main = container.querySelector("main");
    expect(main).toBeTruthy();
    expect(main?.classList.contains("min-h-screen")).toBe(true);
  });
});
