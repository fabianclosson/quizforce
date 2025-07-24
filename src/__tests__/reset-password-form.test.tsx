import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Supabase
const mockGetSession = jest.fn();
const mockUpdateUser = jest.fn();
jest.mock("@/lib/supabase", () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      updateUser: mockUpdateUser,
    },
  }),
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the form correctly with valid session", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
      error: null,
    });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/enter your new password/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/confirm your new password/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /update password/i })
      ).toBeInTheDocument();
    });
  });

  it("shows error for invalid session", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByText(/invalid or expired reset link/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /request new reset link/i })
      ).toBeInTheDocument();
    });
  });

  it("shows password validation errors", async () => {
    const user = userEvent.setup();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
      error: null,
    });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/enter your new password/i)
      ).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText(
      /enter your new password/i
    );
    const submitButton = screen.getByRole("button", {
      name: /update password/i,
    });

    // Test short password
    await user.type(passwordInput, "short");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("shows password complexity validation errors", async () => {
    const user = userEvent.setup();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
      error: null,
    });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/enter your new password/i)
      ).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText(
      /enter your new password/i
    );
    const submitButton = screen.getByRole("button", {
      name: /update password/i,
    });

    // Test password without uppercase, lowercase, and number
    await user.type(passwordInput, "simplepassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must contain at least one uppercase letter/i)
      ).toBeInTheDocument();
    });
  });

  it("shows password mismatch error", async () => {
    const user = userEvent.setup();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
      error: null,
    });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/enter your new password/i)
      ).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText(
      /enter your new password/i
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      /confirm your new password/i
    );
    const submitButton = screen.getByRole("button", {
      name: /update password/i,
    });

    await user.type(passwordInput, "ValidPassword123");
    await user.type(confirmPasswordInput, "DifferentPassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it("successfully updates password", async () => {
    const user = userEvent.setup();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
      error: null,
    });
    mockUpdateUser.mockResolvedValue({ error: null });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/enter your new password/i)
      ).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText(
      /enter your new password/i
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      /confirm your new password/i
    );
    const submitButton = screen.getByRole("button", {
      name: /update password/i,
    });

    await user.type(passwordInput, "ValidPassword123");
    await user.type(confirmPasswordInput, "ValidPassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: "ValidPassword123",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/your password has been updated successfully/i)
      ).toBeInTheDocument();
    });

    // Fast-forward timers to trigger redirect
    jest.advanceTimersByTime(2000);

    expect(mockPush).toHaveBeenCalledWith(
      "/auth/signin?message=Password updated successfully"
    );
  });

  it("shows error when password update fails", async () => {
    const user = userEvent.setup();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
      error: null,
    });
    const errorMessage = "Password update failed";
    mockUpdateUser.mockResolvedValue({ error: new Error(errorMessage) });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/enter your new password/i)
      ).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText(
      /enter your new password/i
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      /confirm your new password/i
    );
    const submitButton = screen.getByRole("button", {
      name: /update password/i,
    });

    await user.type(passwordInput, "ValidPassword123");
    await user.type(confirmPasswordInput, "ValidPassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
      error: null,
    });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/enter your new password/i)
      ).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText(
      /enter your new password/i
    );
    const toggleButtons = screen.getAllByRole("button", { name: "" }); // Eye/EyeOff buttons

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute("type", "password");

    // Click to show password
    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click to hide password again
    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("disables form during submission", async () => {
    const user = userEvent.setup();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
      error: null,
    });
    // Mock a delayed response
    mockUpdateUser.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/enter your new password/i)
      ).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText(
      /enter your new password/i
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      /confirm your new password/i
    );
    const submitButton = screen.getByRole("button", {
      name: /update password/i,
    });

    await user.type(passwordInput, "ValidPassword123");
    await user.type(confirmPasswordInput, "ValidPassword123");
    await user.click(submitButton);

    // Check that form is disabled during submission
    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("redirects to forgot password page when session is invalid", async () => {
    const user = userEvent.setup();
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /request new reset link/i })
      ).toBeInTheDocument();
    });

    const requestNewLinkButton = screen.getByRole("button", {
      name: /request new reset link/i,
    });
    await user.click(requestNewLinkButton);

    expect(mockPush).toHaveBeenCalledWith("/auth/forgot-password");
  });

  it("handles session check errors", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: new Error("Session check failed"),
    });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByText(/invalid or expired reset link/i)
      ).toBeInTheDocument();
    });
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "123" } } },
      error: null,
    });
    // Mock a delayed response
    mockUpdateUser.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/enter your new password/i)
      ).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText(
      /enter your new password/i
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      /confirm your new password/i
    );
    const submitButton = screen.getByRole("button", {
      name: /update password/i,
    });

    await user.type(passwordInput, "ValidPassword123");
    await user.type(confirmPasswordInput, "ValidPassword123");
    await user.click(submitButton);

    // Check for loading spinner or disabled state
    expect(submitButton).toBeDisabled();
  });
});
