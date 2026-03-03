import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { mockPush, mockSignIn, mockSignInWithPopup } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSignIn: vi.fn(),
  mockSignInWithPopup: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/app/lib/firebase-config", () => ({
  auth: {},
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: mockSignIn,
  GoogleAuthProvider: class {
    setCustomParameters() {}
  },
  signInWithPopup: mockSignInWithPopup,
}));

import SignInPage from "@/app/sign-in/page";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Sign In page", () => {
  it("renders the Sign In heading", () => {
    render(<SignInPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Sign In");
  });

  it("renders email and password input fields", () => {
    render(<SignInPage />);
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  it("renders the Sign In submit button", () => {
    render(<SignInPage />);
    const buttons = screen.getAllByRole("button");
    const signInBtn = buttons.find((b) => b.textContent === "Sign In");
    expect(signInBtn).toBeTruthy();
  });

  it("renders the Continue with Google button", () => {
    render(<SignInPage />);
    expect(screen.getByText("Continue with Google")).toBeTruthy();
  });

  it("renders the Forgot password link", () => {
    render(<SignInPage />);
    expect(screen.getByText("Forgot password?")).toBeTruthy();
  });

  it("renders a link to the Sign Up page", () => {
    render(<SignInPage />);
    const signUpLink = screen.getAllByText("Sign Up");
    expect(signUpLink.length).toBeGreaterThan(0);
  });

  it("renders the welcome message on the left panel", () => {
    render(<SignInPage />);
    expect(screen.getByText("Welcome back.")).toBeTruthy();
  });

  it("renders the quote by Frank Smith", () => {
    render(<SignInPage />);
    expect(screen.getByText("— Frank Smith")).toBeTruthy();
  });

  it("submits form and navigates on successful sign in", async () => {
    mockSignIn.mockResolvedValueOnce({});
    render(<SignInPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");

    const form = emailInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error message on sign in failure", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("Invalid credentials"));
    render(<SignInPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await userEvent.type(emailInput, "bad@example.com");
    await userEvent.type(passwordInput, "wrong");

    const form = emailInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeTruthy();
    });
  });

  it("handles Google sign in successfully", async () => {
    mockSignInWithPopup.mockResolvedValueOnce({});
    render(<SignInPage />);

    const googleBtn = screen.getByText("Continue with Google").closest("button")!;
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error on Google sign in failure", async () => {
    mockSignInWithPopup.mockRejectedValueOnce(new Error("Google sign up failed."));
    render(<SignInPage />);

    const googleBtn = screen.getByText("Continue with Google").closest("button")!;
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(screen.getByText("Google sign up failed.")).toBeTruthy();
    });
  });
});
