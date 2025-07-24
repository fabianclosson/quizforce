import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  ResponsiveImage,
  HeroImage,
  CardImage,
  ResponsiveAvatarImage,
  ThumbnailImage,
  RESPONSIVE_SIZES,
  ASPECT_RATIOS,
} from "@/components/ui/responsive-image";
import { ImageProps } from "next/image";

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockImage({
    alt,
    className,
    fill,
    priority,
    loading,
    ...props
  }: ImageProps) {
    return (
      <div
        {...props}
        data-alt={alt}
        className={className}
        data-testid="next-image"
        data-fill={fill}
        data-priority={priority}
        data-loading={loading}
      />
    );
  };
});

describe("ResponsiveImage", () => {
  const defaultProps = {
    src: "/test-image.jpg",
    alt: "Test image",
    width: 800,
    height: 600,
  };

  describe("Basic functionality", () => {
    it("renders with default props", () => {
      render(<ResponsiveImage {...defaultProps} />);

      const image = screen.getByTestId("next-image");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("data-alt", "Test image");
      expect(image).toHaveAttribute("src", "/test-image.jpg");
    });

    it("applies correct sizes attribute", () => {
      render(<ResponsiveImage {...defaultProps} sizes="full" />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("sizes", RESPONSIVE_SIZES.full);
    });

    it("applies custom sizes string", () => {
      const customSizes = "(min-width: 768px) 50vw, 100vw";
      render(<ResponsiveImage {...defaultProps} sizes={customSizes} />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("sizes", customSizes);
    });

    it("applies priority when specified", () => {
      render(<ResponsiveImage {...defaultProps} priority />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("data-priority", "true");
    });

    it("applies loading strategy", () => {
      render(<ResponsiveImage {...defaultProps} loading="eager" />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("data-loading", "eager");
    });
  });

  describe("Aspect ratio handling", () => {
    it("renders without container when no aspect ratio", () => {
      render(<ResponsiveImage {...defaultProps} />);

      const image = screen.getByTestId("next-image");
      expect(image).toBeInTheDocument();
      expect(image.parentElement?.tagName).toBe("DIV"); // Just the test container
    });

    it("renders with container when aspect ratio is specified", () => {
      render(<ResponsiveImage {...defaultProps} aspectRatio="square" />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("data-fill", "true");

      const container = image.parentElement;
      expect(container).toHaveClass("aspect-[1/1]");
      expect(container).toHaveClass("relative");
      expect(container).toHaveClass("overflow-hidden");
    });

    it("applies custom aspect ratio", () => {
      render(<ResponsiveImage {...defaultProps} aspectRatio="21/9" />);

      const image = screen.getByTestId("next-image");
      const container = image.parentElement;
      expect(container).toHaveClass("aspect-[21/9]");
    });

    it("applies predefined aspect ratios", () => {
      render(<ResponsiveImage {...defaultProps} aspectRatio="video" />);

      const image = screen.getByTestId("next-image");
      const container = image.parentElement;
      expect(container).toHaveClass("aspect-[16/9]");
    });
  });

  describe("Styling and appearance", () => {
    it("applies rounded corners", () => {
      render(<ResponsiveImage {...defaultProps} rounded="lg" />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveClass("rounded-lg");
    });

    it("applies full rounded corners", () => {
      render(<ResponsiveImage {...defaultProps} rounded="full" />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveClass("rounded-full");
    });

    it("applies default rounded when rounded=true", () => {
      render(<ResponsiveImage {...defaultProps} rounded />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveClass("rounded-md");
    });

    it("applies object fit classes", () => {
      render(<ResponsiveImage {...defaultProps} objectFit="contain" />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveClass("object-contain");
    });

    it("applies custom className", () => {
      render(<ResponsiveImage {...defaultProps} className="custom-class" />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveClass("custom-class");
    });

    it("applies container className with aspect ratio", () => {
      render(
        <ResponsiveImage
          {...defaultProps}
          aspectRatio="square"
          containerClassName="custom-container"
        />
      );

      const image = screen.getByTestId("next-image");
      const container = image.parentElement;
      expect(container).toHaveClass("custom-container");
    });
  });

  describe("Placeholder handling", () => {
    it("applies blur placeholder when enabled", () => {
      render(<ResponsiveImage {...defaultProps} showBlurPlaceholder />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("placeholder", "blur");
    });

    it("applies empty placeholder by default", () => {
      render(<ResponsiveImage {...defaultProps} />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("placeholder", "empty");
    });
  });
});

describe("Preset Components", () => {
  const defaultProps = {
    src: "/test-image.jpg",
    alt: "Test image",
    width: 800,
    height: 600,
  };

  describe("HeroImage", () => {
    it("renders with correct preset configuration", () => {
      render(<HeroImage {...defaultProps} />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("sizes", RESPONSIVE_SIZES.full);
      expect(image).toHaveAttribute("data-priority", "true");

      const container = image.parentElement;
      expect(container).toHaveClass("aspect-[3/1]");
    });
  });

  describe("CardImage", () => {
    it("renders with correct preset configuration", () => {
      render(<CardImage {...defaultProps} />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("sizes", RESPONSIVE_SIZES.card);

      const container = image.parentElement;
      expect(container).toHaveClass("aspect-[3/2]");
    });
  });

  describe("ResponsiveAvatarImage", () => {
    it("renders with correct preset configuration", () => {
      render(<ResponsiveAvatarImage {...defaultProps} />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("sizes", RESPONSIVE_SIZES.avatar);
      expect(image).toHaveClass("object-cover");

      const container = image.parentElement;
      expect(container).toHaveClass("aspect-[1/1]");
      expect(container).toHaveClass("rounded-full");
    });
  });

  describe("ThumbnailImage", () => {
    it("renders with correct preset configuration", () => {
      render(<ThumbnailImage {...defaultProps} />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("sizes", RESPONSIVE_SIZES.thumbnail);

      const container = image.parentElement;
      expect(container).toHaveClass("aspect-[1/1]");
      expect(container).toHaveClass("rounded-md");
    });
  });
});

describe("Constants", () => {
  it("exports RESPONSIVE_SIZES with correct values", () => {
    expect(RESPONSIVE_SIZES).toEqual({
      full: "100vw",
      content: "(min-width: 1024px) 50vw, (min-width: 768px) 75vw, 100vw",
      card: "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
      avatar: "(min-width: 768px) 128px, 96px",
      thumbnail: "(min-width: 768px) 96px, 64px",
      icon: "48px",
    });
  });

  it("exports ASPECT_RATIOS with correct values", () => {
    expect(ASPECT_RATIOS).toEqual({
      square: "1/1",
      video: "16/9",
      photo: "4/3",
      banner: "3/1",
      card: "3/2",
    });
  });
});

describe("Edge cases", () => {
  const defaultProps = {
    src: "/test-image.jpg",
    alt: "Test image",
    width: 800,
    height: 600,
  };

  it("handles empty alt text", () => {
    render(<ResponsiveImage {...defaultProps} alt="" />);

    const image = screen.getByTestId("next-image");
    expect(image).toHaveAttribute("alt", "");
  });

  it("handles missing optional props gracefully", () => {
    render(
      <ResponsiveImage src="/test.jpg" alt="test" width={100} height={100} />
    );

    const image = screen.getByTestId("next-image");
    expect(image).toBeInTheDocument();
  });

  it("combines multiple styling props correctly", () => {
    render(
      <ResponsiveImage
        {...defaultProps}
        aspectRatio="square"
        rounded="lg"
        objectFit="contain"
        className="custom-class"
        containerClassName="custom-container"
      />
    );

    const image = screen.getByTestId("next-image");
    expect(image).toHaveClass("object-contain");
    expect(image).toHaveClass("custom-class");

    const container = image.parentElement;
    expect(container).toHaveClass("aspect-[1/1]");
    expect(container).toHaveClass("rounded-lg");
    expect(container).toHaveClass("custom-container");
  });
});
