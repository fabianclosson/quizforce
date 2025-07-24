import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { MobileNav } from "../mobile-nav";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock theme switcher
jest.mock("../../theme-switcher", () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">Theme Switcher</div>,
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("MobileNav", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/dashboard");
    // Reset body overflow style
    document.body.style.overflow = "unset";
  });

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = "unset";
  });

  it("renders mobile navigation trigger button", () => {
    render(<MobileNav />);

    const triggerButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton).toHaveClass("md:hidden");
  });

  it("opens navigation menu when trigger is clicked", async () => {
    render(<MobileNav />);

    const triggerButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("QuizForce")).toBeInTheDocument();
      expect(screen.getByText("Navigation")).toBeInTheDocument();
    });
  });

  it("displays navigation items with correct structure", async () => {
    render(<MobileNav />);

    const triggerButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Overview and progress")).toBeInTheDocument();
      expect(screen.getByText("Catalog")).toBeInTheDocument();
      expect(screen.getByText("Browse certifications")).toBeInTheDocument();
      expect(screen.getByText("Practice Exams")).toBeInTheDocument();
      expect(screen.getByText("Test your knowledge")).toBeInTheDocument();
      expect(screen.getByText("Community")).toBeInTheDocument();
      expect(screen.getByText("Connect with learners")).toBeInTheDocument();
    });
  });

  it('shows "NEW" badge on catalog item', async () => {
    render(<MobileNav />);

    const triggerButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("NEW")).toBeInTheDocument();
    });
  });

  it("highlights active navigation item", async () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<MobileNav />);

    const triggerButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      const dashboardLink = screen.getByText("Dashboard").closest("a");
      expect(dashboardLink).toHaveClass("bg-primary/10", "text-primary");
    });
  });

  it("displays user section when user is provided", async () => {
    const user = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      avatarUrl: "https://example.com/avatar.jpg",
    };

    render(<MobileNav user={user} />);

    const triggerButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("Premium Member")).toBeInTheDocument();
    });
  });

  it("displays quick actions for authenticated users", async () => {
    const user = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    };

    render(<MobileNav user={user} />);

    const triggerButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Account preferences")).toBeInTheDocument();
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("Updates and alerts")).toBeInTheDocument();
      expect(screen.getByText("Help & Support")).toBeInTheDocument();
      expect(screen.getByText("Get assistance")).toBeInTheDocument();
    });
  });

  it("displays notification badge on notifications", async () => {
    const user = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    };

    render(<MobileNav user={user} />);

    const triggerButton = screen.getByRole("button", {
      name: /open menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      const notificationBadges = screen.getAllByText("3");
      expect(notificationBadges.length).toBeGreaterThan(0);
    });
  });

  it("displays account actions for authenticated users", async () => {
    const user = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    };

    render(<MobileNav user={user} />);

    const triggerButton = screen.getByRole("button", {
      name: /open menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Account")).toBeInTheDocument();
      expect(screen.getByText("My Account")).toBeInTheDocument();
      expect(screen.getByText("Purchase History")).toBeInTheDocument();
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });
  });

  it("displays auth actions for non-authenticated users", async () => {
    render(<MobileNav />);

    const triggerButton = screen.getByRole("button", {
      name: /open menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Sign in to access your dashboard and track your progress"
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
      expect(screen.getByText("Start Free Practice")).toBeInTheDocument();
    });
  });

  it("displays theme switcher section", async () => {
    render(<MobileNav />);

    const triggerButton = screen.getByRole("button", {
      name: /open menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Appearance")).toBeInTheDocument();
      expect(screen.getByText("Theme")).toBeInTheDocument();
      expect(screen.getByTestId("theme-switcher")).toBeInTheDocument();
    });
  });

  it("displays footer with version info", async () => {
    render(<MobileNav />);

    const triggerButton = screen.getByRole("button", {
      name: /open menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(
        screen.getByText("QuizForce v1.0 • Made with ❤️ for learners")
      ).toBeInTheDocument();
    });
  });

  it("closes menu when close button is clicked", async () => {
    render(<MobileNav />);

    const triggerButton = screen.getByRole("button", {
      name: /open menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("QuizForce")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", {
      name: /close navigation menu/i,
    });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Navigation")).not.toBeInTheDocument();
    });
  });

  it("prevents body scroll when menu is open", async () => {
    render(<MobileNav />);

    const triggerButton = screen.getByRole("button", {
      name: /open menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("hidden");
    });
  });

  it("restores body scroll when menu is closed", async () => {
    render(<MobileNav />);

    const triggerButton = screen.getByRole("button", {
      name: /open menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("hidden");
    });

    const closeButton = screen.getByRole("button", {
      name: /close navigation menu/i,
    });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("unset");
    });
  });

  it("has proper accessibility attributes", async () => {
    render(<MobileNav />);

    const triggerButton = screen.getByRole("button", {
      name: /open menu/i,
    });
    expect(triggerButton).toHaveAttribute("aria-label", "Open menu");

    fireEvent.click(triggerButton);

    await waitFor(() => {
      const closeButton = screen.getByRole("button", {
        name: /close navigation menu/i,
      });
      expect(closeButton).toHaveAttribute(
        "aria-label",
        "Close navigation menu"
      );

      // Check for screen reader description
      expect(
        screen.getByText(
          "Mobile navigation menu with quick access to all main sections"
        )
      ).toHaveClass("sr-only");
    });
  });

  it("renders user avatar with proper fallback", async () => {
    const user = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    };

    render(<MobileNav user={user} />);

    const triggerButton = screen.getByRole("button", {
      name: /open menu/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      const avatar = screen.getByText("JD"); // Avatar fallback initials
      expect(avatar).toBeInTheDocument();
    });
  });
});
