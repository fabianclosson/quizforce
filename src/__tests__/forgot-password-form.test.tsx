import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

// Mock Supabase
const mockResetPasswordForEmail = jest.fn();
jest.mock("@/lib/supabase", () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

// Mock window.location.origin
Object.defineProperty(window, "location", {
  value: {
    origin: "http://localhost:3000",
  },
  writable: true,
});

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form correctly", () => {
    render(<ForgotPasswordForm />);

    expect(
      screen.getByPlaceholderText(/john@example.com/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });

  it("shows validation error for empty email", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });

  it("successfully sends reset email", async () => {
    const user = userEvent.setup();
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        "test@example.com",
        {
          redirectTo: "http://localhost:3000/auth/reset-password",
        }
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/if an account with that email exists/i)
      ).toBeInTheDocument();
    });
  });

  it("shows error message when reset fails", async () => {
    const user = userEvent.setup();
    const errorMessage = "Email not found";
    mockResetPasswordForEmail.mockResolvedValue({
      error: new Error(errorMessage),
    });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("disables form during submission", async () => {
    const user = userEvent.setup();
    // Mock a delayed response
    mockResetPasswordForEmail.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    // Check that form is disabled during submission
    expect(emailInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(
        screen.getByText(/if an account with that email exists/i)
      ).toBeInTheDocument();
    });
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    // Mock a delayed response
    mockResetPasswordForEmail.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    // Check for loading spinner
    expect(
      screen.getByTestId("loading-spinner") || submitButton
    ).toBeInTheDocument();

    // Wait for submission to complete
    await waitFor(() => {
      expect(
        screen.getByText(/if an account with that email exists/i)
      ).toBeInTheDocument();
    });
  });

  it("allows sending another email after success", async () => {
    const user = userEvent.setup();
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    // First submission
    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/if an account with that email exists/i)
      ).toBeInTheDocument();
    });

    // Click "Send Another Email" button
    const sendAnotherButton = screen.getByRole("button", {
      name: /send another email/i,
    });
    await user.click(sendAnotherButton);

    // Should return to the form
    expect(
      screen.getByPlaceholderText(/john@example.com/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it("includes mail icon in email input", () => {
    render(<ForgotPasswordForm />);

    const mailIcon =
      screen.getByTestId("mail-icon") ||
      document.querySelector('[data-lucide="mail"]');
    expect(
      mailIcon || screen.getByPlaceholderText(/john@example.com/i).parentElement
    ).toBeInTheDocument();
  });

  it("handles network errors gracefully", async () => {
    const user = userEvent.setup();
    mockResetPasswordForEmail.mockRejectedValue(new Error("Network error"));

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
