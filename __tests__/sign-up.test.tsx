import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { mockPush, mockCreateUser, mockUpdateProfile, mockSignInWithPopup } =
  vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockCreateUser: vi.fn(),
    mockUpdateProfile: vi.fn(),
    mockSignInWithPopup: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/app/lib/firebase-config", () => ({
  auth: {},
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: mockCreateUser,
  updateProfile: mockUpdateProfile,
  GoogleAuthProvider: class {
    setCustomParameters() {}
  },
  signInWithPopup: mockSignInWithPopup,
}));

import SignUpPage from "@/app/sign-up/page";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Sign Up page", () => {
  it("renders the Create Account heading", () => {
    render(<SignUpPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Create Account");
  });

  it("renders all form fields", () => {
    render(<SignUpPage />);
    expect(screen.getByLabelText("First Name")).toBeTruthy();
    expect(screen.getByLabelText("Last Name")).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(screen.getByLabelText("Confirm Password")).toBeTruthy();
  });

  it("renders the Create Account submit button", () => {
    render(<SignUpPage />);
    const buttons = screen.getAllByRole("button");
    const createBtn = buttons.find((b) =>
      b.textContent?.includes("Create Account")
    );
    expect(createBtn).toBeTruthy();
  });

  it("renders the Continue with Google button", () => {
    render(<SignUpPage />);
    expect(screen.getByText("Continue with Google")).toBeTruthy();
  });

  it("renders password requirements hint", () => {
    render(<SignUpPage />);
    expect(screen.getByText(/Must be at least 8 characters/)).toBeTruthy();
  });

  it("renders link to Terms & Privacy Policy", () => {
    render(<SignUpPage />);
    expect(screen.getByText("Terms & Privacy Policy")).toBeTruthy();
  });

  it("renders a link to Sign In page", () => {
    render(<SignUpPage />);
    const signInLinks = screen.getAllByText("Sign In");
    expect(signInLinks.length).toBeGreaterThan(0);
  });

  it("renders the left panel motivational message", () => {
    render(<SignUpPage />);
    expect(screen.getByText("Start something")).toBeTruthy();
    expect(screen.getByText("extraordinary.")).toBeTruthy();
  });

  it("shows error when passwords don't match", async () => {
    render(<SignUpPage />);

    await userEvent.type(screen.getByLabelText("First Name"), "John");
    await userEvent.type(screen.getByLabelText("Last Name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "john@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "pass1234");
    await userEvent.type(
      screen.getByLabelText("Confirm Password"),
      "different"
    );

    const form = screen.getByLabelText("Email").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeTruthy();
    });
  });

  it("submits form and navigates on successful sign up", async () => {
    const mockUser = { user: { uid: "123" } };
    mockCreateUser.mockResolvedValueOnce(mockUser);
    mockUpdateProfile.mockResolvedValueOnce({});
    render(<SignUpPage />);

    await userEvent.type(screen.getByLabelText("First Name"), "John");
    await userEvent.type(screen.getByLabelText("Last Name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "john@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "Pass1234");
    await userEvent.type(
      screen.getByLabelText("Confirm Password"),
      "Pass1234"
    );

    const form = screen.getByLabelText("Email").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalled();
      expect(mockUpdateProfile).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/sign-in");
    });
  });

  it("shows error on sign up failure", async () => {
    mockCreateUser.mockRejectedValueOnce(new Error("Email already in use"));
    render(<SignUpPage />);

    await userEvent.type(screen.getByLabelText("First Name"), "Jane");
    await userEvent.type(screen.getByLabelText("Last Name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "jane@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "Pass1234");
    await userEvent.type(
      screen.getByLabelText("Confirm Password"),
      "Pass1234"
    );

    const form = screen.getByLabelText("Email").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeTruthy();
    });
  });

  it("handles Google sign up successfully", async () => {
    mockSignInWithPopup.mockResolvedValueOnce({});
    render(<SignUpPage />);

    const googleBtn = screen
      .getByText("Continue with Google")
      .closest("button")!;
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error on Google sign up failure", async () => {
    mockSignInWithPopup.mockRejectedValueOnce(
      new Error("Google sign up failed.")
    );
    render(<SignUpPage />);

    const googleBtn = screen
      .getByText("Continue with Google")
      .closest("button")!;
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(screen.getByText("Google sign up failed.")).toBeTruthy();
    });
  });
});
