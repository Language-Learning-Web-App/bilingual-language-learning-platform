import "@testing-library/jest-dom/vitest";

// Mock IntersectionObserver for framer-motion useInView
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});
