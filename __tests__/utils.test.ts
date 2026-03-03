import { describe, it, expect } from "vitest";
import { cn } from "@/app/lib/utils";

describe("cn utility function", () => {
  it("merges class names correctly", () => {
    const result = cn("px-4", "py-2", "text-sm");
    expect(result).toBe("px-4 py-2 text-sm");
  });

  it("handles conflicting tailwind classes by keeping the last one", () => {
    const result = cn("px-4", "px-8");
    expect(result).toBe("px-8");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("filters out falsy values", () => {
    const result = cn("text-sm", false, null, undefined, "font-bold");
    expect(result).toBe("text-sm font-bold");
  });

  it("returns empty string for no inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });
});
