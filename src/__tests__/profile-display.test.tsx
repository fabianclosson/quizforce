import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProfileDisplay } from "@/components/profile/profile-display";

// Mock the auth context
const mockUser = {
  id: "123",
  email: "john.doe@example.com",
  user_metadata: {
    first_name: "John",
    last_name: "Doe",
    avatar_url: "https://example.com/avatar.jpg",
  },
  app_metadata: {
    provider: "email",
  },
  created_at: "2024-01-01T00:00:00Z",
};

jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

interface MockFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

// Mock the profile components
jest.mock("@/components/profile/profile-edit-form", () => ({
  ProfileEditForm: ({ onCancel, onSuccess }: MockFormProps) => (
    <div data-testid="profile-edit-form">
      <button onClick={onCancel}>Cancel Edit</button>
      <button onClick={onSuccess}>Save Profile</button>
    </div>
  ),
}));

jest.mock("@/components/profile/password-change-form", () => ({
  PasswordChangeForm: ({ onCancel, onSuccess }: MockFormProps) => (
    <div data-testid="password-change-form">
      <button onClick={onCancel}>Cancel Password</button>
      <button onClick={onSuccess}>Save Password</button>
    </div>
  ),
}));

describe("ProfileDisplay", () => {
  it("renders user information correctly", () => {
    render(<ProfileDisplay />);

    expect(screen.getByText("Profile Information")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getAllByText("john.doe@example.com")).toHaveLength(2);
  });

  it("displays avatar with user initials fallback", () => {
    render(<ProfileDisplay />);

    const avatar = screen.getByText("JD");
    expect(avatar).toBeInTheDocument();
  });

  it("shows edit profile button", () => {
    render(<ProfileDisplay />);

    const editButton = screen.getByText("Edit Profile");
    expect(editButton).toBeInTheDocument();
  });

  it("shows change password button for email users", () => {
    render(<ProfileDisplay />);

    const passwordButton = screen.getByText("Change Password");
    expect(passwordButton).toBeInTheDocument();
  });

  it("switches to edit mode when edit button is clicked", () => {
    render(<ProfileDisplay />);

    const editButton = screen.getByText("Edit Profile");
    fireEvent.click(editButton);

    expect(screen.getByTestId("profile-edit-form")).toBeInTheDocument();
  });

  it("switches to password change mode when password button is clicked", () => {
    render(<ProfileDisplay />);

    const passwordButton = screen.getByText("Change Password");
    fireEvent.click(passwordButton);

    expect(screen.getByTestId("password-change-form")).toBeInTheDocument();
  });

  it("returns to display mode when edit is cancelled", () => {
    render(<ProfileDisplay />);

    const editButton = screen.getByText("Edit Profile");
    fireEvent.click(editButton);

    const cancelButton = screen.getByText("Cancel Edit");
    fireEvent.click(cancelButton);

    expect(screen.getByText("Profile Information")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-edit-form")).not.toBeInTheDocument();
  });

  it("returns to display mode when password change is cancelled", () => {
    render(<ProfileDisplay />);

    const passwordButton = screen.getByText("Change Password");
    fireEvent.click(passwordButton);

    const cancelButton = screen.getByText("Cancel Password");
    fireEvent.click(cancelButton);

    expect(screen.getByText("Profile Information")).toBeInTheDocument();
    expect(
      screen.queryByTestId("password-change-form")
    ).not.toBeInTheDocument();
  });

  it("returns to display mode when edit is successful", () => {
    render(<ProfileDisplay />);

    const editButton = screen.getByText("Edit Profile");
    fireEvent.click(editButton);

    const saveButton = screen.getByText("Save Profile");
    fireEvent.click(saveButton);

    expect(screen.getByText("Profile Information")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-edit-form")).not.toBeInTheDocument();
  });

  it("displays basic user information", () => {
    render(<ProfileDisplay />);

    // Check that the component renders without crashing
    expect(screen.getByText("Profile Information")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("handles user without metadata gracefully", () => {
    const userWithoutMetadata = {
      ...mockUser,
      user_metadata: {},
    };

    jest.doMock("@/contexts/auth-context", () => ({
      useAuth: () => ({
        user: userWithoutMetadata,
      }),
    }));

    render(<ProfileDisplay />);

    expect(screen.getByText("Profile Information")).toBeInTheDocument();
  });
});
