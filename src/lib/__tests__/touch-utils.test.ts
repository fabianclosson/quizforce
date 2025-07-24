import {
  touchTargetSizes,
  touchSpacing,
  touchFeedback,
  responsiveHover,
  touchForm,
  touchClass,
  createTouchButton,
  createTouchCard,
  createTouchListItem,
  preventTextSelect,
  touchNavigation,
} from "../touch-utils";

describe("Touch Utilities", () => {
  describe("touchTargetSizes", () => {
    it("should provide minimum touch target sizes", () => {
      expect(touchTargetSizes.min).toBe("min-h-[44px] min-w-[44px]");
      expect(touchTargetSizes.sm).toBe("h-10 min-w-[44px]");
      expect(touchTargetSizes.md).toBe("h-11 min-w-[48px]");
      expect(touchTargetSizes.lg).toBe("h-12 min-w-[52px]");
      expect(touchTargetSizes.xl).toBe("h-14 min-w-[56px]");
    });
  });

  describe("touchSpacing", () => {
    it("should provide appropriate spacing for touch interfaces", () => {
      expect(touchSpacing.min).toBe("gap-2");
      expect(touchSpacing.comfortable).toBe("gap-3");
      expect(touchSpacing.spacious).toBe("gap-4");
      expect(touchSpacing.touchPadding).toBe("px-4 py-3");
      expect(touchSpacing.touchPaddingSm).toBe("px-3 py-2");
      expect(touchSpacing.touchPaddingLg).toBe("px-6 py-4");
    });
  });

  describe("touchFeedback", () => {
    it("should provide visual feedback classes for touch interactions", () => {
      expect(touchFeedback.scale).toBe(
        "active:scale-95 transition-transform duration-75"
      );
      expect(touchFeedback.scaleSubtle).toBe(
        "active:scale-[0.98] transition-transform duration-75"
      );
      expect(touchFeedback.primary).toBe(
        "active:bg-primary/90 transition-colors duration-150"
      );
      expect(touchFeedback.button).toBe(
        "active:scale-95 active:shadow-sm transition-all duration-150"
      );
      expect(touchFeedback.card).toBe(
        "active:scale-[0.98] active:shadow-md transition-all duration-200"
      );
      expect(touchFeedback.link).toBe(
        "active:opacity-70 transition-opacity duration-150"
      );
    });
  });

  describe("responsiveHover", () => {
    it("should provide hover and active states for responsive design", () => {
      expect(responsiveHover.button).toContain("hover:bg-primary/90");
      expect(responsiveHover.button).toContain("active:bg-primary/80");
      expect(responsiveHover.button).toContain("active:scale-95");

      expect(responsiveHover.card).toContain("hover:shadow-lg");
      expect(responsiveHover.card).toContain("active:shadow-md");
      expect(responsiveHover.card).toContain("active:scale-[0.98]");
    });
  });

  describe("touchForm", () => {
    it("should provide enhanced form element sizes", () => {
      expect(touchForm.input).toBe("h-11 px-4 py-3 text-base");
      expect(touchForm.select).toBe("h-11 px-4 py-3 text-base");
      expect(touchForm.textarea).toBe("min-h-[88px] px-4 py-3 text-base");
      expect(touchForm.checkbox).toBe("h-5 w-5");
      expect(touchForm.radio).toBe("h-5 w-5");
    });
  });

  describe("touchClass", () => {
    it("should combine classes using clsx and twMerge", () => {
      const result = touchClass("bg-red-500", "bg-blue-500", "text-white");
      expect(result).toBe("bg-blue-500 text-white"); // twMerge should handle conflicting classes
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = touchClass(
        "base-class",
        isActive && "active-class",
        false && "inactive-class"
      );
      expect(result).toBe("base-class active-class");
    });
  });

  describe("createTouchButton", () => {
    it("should create touch-optimized button classes with defaults", () => {
      const result = createTouchButton();
      expect(result).toContain(touchTargetSizes.md);
      expect(result).toContain(touchSpacing.touchPadding);
      expect(result).toContain("rounded-md");
      expect(result).toContain("font-medium");
      expect(result).toContain("focus-visible:outline-none");
    });

    it("should accept custom variant and size", () => {
      const result = createTouchButton("secondary", "lg");
      expect(result).toContain(touchTargetSizes.lg);
      expect(result).toContain(responsiveHover.secondary);
    });
  });

  describe("createTouchCard", () => {
    it("should create touch-optimized card classes with default variant", () => {
      const result = createTouchCard();
      expect(result).toContain(touchSpacing.touchPadding);
      expect(result).toContain(responsiveHover.card);
      expect(result).toContain("rounded-lg border cursor-pointer");
    });

    it("should accept subtle variant", () => {
      const result = createTouchCard("subtle");
      expect(result).toContain(responsiveHover.cardSubtle);
    });
  });

  describe("createTouchListItem", () => {
    it("should create touch-optimized list item classes", () => {
      const result = createTouchListItem();
      expect(result).toContain(touchTargetSizes.md);
      expect(result).toContain(touchSpacing.touchPadding);
      expect(result).toContain(responsiveHover.accent);
      expect(result).toContain("rounded-md cursor-pointer flex items-center");
    });
  });

  describe("preventTextSelect", () => {
    it("should provide text selection prevention class", () => {
      expect(preventTextSelect).toBe("select-none");
    });
  });

  describe("touchNavigation", () => {
    it("should provide navigation-specific touch classes", () => {
      expect(touchNavigation.item).toContain(touchTargetSizes.md);
      expect(touchNavigation.item).toContain(touchSpacing.touchPadding);
      expect(touchNavigation.item).toContain("rounded-md font-medium");

      expect(touchNavigation.link).toContain(touchTargetSizes.min);
      expect(touchNavigation.link).toContain("px-3 py-2");
      expect(touchNavigation.link).toContain("rounded-md");
    });
  });
});
