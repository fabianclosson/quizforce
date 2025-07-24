import {
  MOBILE_INPUT_TYPES,
  INPUT_MODES,
  AUTOCOMPLETE_VALUES,
  MOBILE_INPUT_PRESETS,
  TOUCH_TARGET_SIZES,
  MOBILE_FORM_SPACING,
  VALIDATION_TIMING,
  ERROR_STYLES,
  A11Y_HELPERS,
  INPUT_VALIDATION,
  getMobileFieldConfig,
  getMobileTouchClasses,
  getMobileFormClasses,
  getMobileButtonClasses,
} from "@/lib/mobile-form-utils";

describe("Mobile Form Utils", () => {
  describe("Constants", () => {
    it("should export MOBILE_INPUT_TYPES with correct values", () => {
      expect(MOBILE_INPUT_TYPES.email).toBe("email");
      expect(MOBILE_INPUT_TYPES.password).toBe("password");
      expect(MOBILE_INPUT_TYPES.tel).toBe("tel");
      expect(MOBILE_INPUT_TYPES.number).toBe("number");
    });

    it("should export INPUT_MODES with correct values", () => {
      expect(INPUT_MODES.email).toBe("email");
      expect(INPUT_MODES.numeric).toBe("numeric");
      expect(INPUT_MODES.tel).toBe("tel");
      expect(INPUT_MODES.text).toBe("text");
    });

    it("should export AUTOCOMPLETE_VALUES with correct values", () => {
      expect(AUTOCOMPLETE_VALUES.email).toBe("email");
      expect(AUTOCOMPLETE_VALUES.firstName).toBe("given-name");
      expect(AUTOCOMPLETE_VALUES.lastName).toBe("family-name");
      expect(AUTOCOMPLETE_VALUES.currentPassword).toBe("current-password");
    });

    it("should export TOUCH_TARGET_SIZES with correct values", () => {
      expect(TOUCH_TARGET_SIZES.small).toBe("h-10 min-h-[40px]");
      expect(TOUCH_TARGET_SIZES.medium).toBe("h-11 min-h-[44px]");
      expect(TOUCH_TARGET_SIZES.large).toBe("h-12 min-h-[48px]");
      expect(TOUCH_TARGET_SIZES.xl).toBe("h-14 min-h-[56px]");
    });
  });

  describe("MOBILE_INPUT_PRESETS", () => {
    it("should have email preset with correct configuration", () => {
      const emailPreset = MOBILE_INPUT_PRESETS.email;
      expect(emailPreset.type).toBe("email");
      expect(emailPreset.inputMode).toBe("email");
      expect(emailPreset.autoComplete).toBe("email");
      expect(emailPreset.autoCapitalize).toBe("none");
      expect(emailPreset.autoCorrect).toBe("off");
      expect(emailPreset.spellCheck).toBe(false);
    });

    it("should have password preset with correct configuration", () => {
      const passwordPreset = MOBILE_INPUT_PRESETS.password;
      expect(passwordPreset.type).toBe("password");
      expect(passwordPreset.inputMode).toBe("text");
      expect(passwordPreset.autoComplete).toBe("current-password");
      expect(passwordPreset.autoCapitalize).toBe("none");
      expect(passwordPreset.autoCorrect).toBe("off");
      expect(passwordPreset.spellCheck).toBe(false);
    });

    it("should have phone preset with correct configuration", () => {
      const phonePreset = MOBILE_INPUT_PRESETS.phone;
      expect(phonePreset.type).toBe("tel");
      expect(phonePreset.inputMode).toBe("tel");
      expect(phonePreset.autoComplete).toBe("tel");
      expect(phonePreset.autoCapitalize).toBe("none");
      expect(phonePreset.autoCorrect).toBe("off");
      expect(phonePreset.spellCheck).toBe(false);
    });

    it("should have firstName preset with correct configuration", () => {
      const firstNamePreset = MOBILE_INPUT_PRESETS.firstName;
      expect(firstNamePreset.type).toBe("text");
      expect(firstNamePreset.inputMode).toBe("text");
      expect(firstNamePreset.autoComplete).toBe("given-name");
      expect(firstNamePreset.autoCapitalize).toBe("words");
      expect(firstNamePreset.autoCorrect).toBe("off");
      expect(firstNamePreset.spellCheck).toBe(false);
    });

    it("should have number preset with correct configuration", () => {
      const numberPreset = MOBILE_INPUT_PRESETS.number;
      expect(numberPreset.type).toBe("number");
      expect(numberPreset.inputMode).toBe("numeric");
      expect(numberPreset.autoComplete).toBe("off");
      expect(numberPreset.autoCapitalize).toBe("none");
      expect(numberPreset.autoCorrect).toBe("off");
      expect(numberPreset.spellCheck).toBe(false);
    });

    it("should have decimal preset with step attribute", () => {
      const decimalPreset = MOBILE_INPUT_PRESETS.decimal;
      expect(decimalPreset.type).toBe("number");
      expect(decimalPreset.inputMode).toBe("decimal");
      expect(decimalPreset.step).toBe("0.01");
    });
  });

  describe("A11Y_HELPERS", () => {
    it("should generate correct field ARIA attributes", () => {
      const ariaProps = A11Y_HELPERS.getFieldAria("Email", true, "email-error");
      expect(ariaProps["aria-label"]).toBe("Email");
      expect(ariaProps["aria-invalid"]).toBe(true);
      expect(ariaProps["aria-describedby"]).toBe("email-error");
    });

    it("should generate correct field ARIA attributes without error", () => {
      const ariaProps = A11Y_HELPERS.getFieldAria("Email", false);
      expect(ariaProps["aria-label"]).toBe("Email");
      expect(ariaProps["aria-invalid"]).toBe(false);
      expect(ariaProps["aria-describedby"]).toBeUndefined();
    });

    it("should generate unique field IDs", () => {
      const fieldId = A11Y_HELPERS.generateFieldId("signup-form", "email");
      expect(fieldId).toBe("signup-form-email");
    });

    it("should generate unique error IDs", () => {
      const errorId = A11Y_HELPERS.generateErrorId("signup-form", "email");
      expect(errorId).toBe("signup-form-email-error");
    });

    it("should generate error announcements", () => {
      const announcement = A11Y_HELPERS.getErrorAnnouncement(
        "Email",
        "Invalid email format"
      );
      expect(announcement).toBe("Error in Email: Invalid email format");
    });
  });

  describe("INPUT_VALIDATION", () => {
    it("should validate email addresses correctly", () => {
      expect(INPUT_VALIDATION.email.test("user@example.com")).toBe(true);
      expect(INPUT_VALIDATION.email.test("test.email+tag@example.co.uk")).toBe(
        true
      );
      expect(INPUT_VALIDATION.email.test("invalid-email")).toBe(false);
      expect(INPUT_VALIDATION.email.test("@example.com")).toBe(false);
      expect(INPUT_VALIDATION.email.test("user@")).toBe(false);
    });

    it("should validate phone numbers correctly", () => {
      expect(INPUT_VALIDATION.phone.test("+1 (555) 123-4567")).toBe(true);
      expect(INPUT_VALIDATION.phone.test("555-123-4567")).toBe(true);
      expect(INPUT_VALIDATION.phone.test("5551234567")).toBe(true);
      expect(INPUT_VALIDATION.phone.test("+44 20 7946 0958")).toBe(true);
      expect(INPUT_VALIDATION.phone.test("123")).toBe(false);
      expect(INPUT_VALIDATION.phone.test("abc")).toBe(false);
    });

    it("should have correct password validation rules", () => {
      expect(INPUT_VALIDATION.password.minLength).toBe(8);
      expect(INPUT_VALIDATION.password.hasUppercase.test("ABC")).toBe(true);
      expect(INPUT_VALIDATION.password.hasLowercase.test("abc")).toBe(true);
      expect(INPUT_VALIDATION.password.hasNumber.test("123")).toBe(true);
      expect(INPUT_VALIDATION.password.hasSpecialChar.test("!@#")).toBe(true);
    });

    it("should validate URLs correctly", () => {
      expect(INPUT_VALIDATION.url.test("https://example.com")).toBe(true);
      expect(INPUT_VALIDATION.url.test("http://test.org")).toBe(true);
      expect(INPUT_VALIDATION.url.test("ftp://example.com")).toBe(false);
      expect(INPUT_VALIDATION.url.test("example.com")).toBe(false);
      expect(INPUT_VALIDATION.url.test("not-a-url")).toBe(false);
    });
  });

  describe("Helper Functions", () => {
    it("should get mobile field config correctly", () => {
      const emailConfig = getMobileFieldConfig("email");
      expect(emailConfig).toEqual(MOBILE_INPUT_PRESETS.email);

      const phoneConfig = getMobileFieldConfig("phone");
      expect(phoneConfig).toEqual(MOBILE_INPUT_PRESETS.phone);
    });

    it("should generate mobile touch classes", () => {
      const defaultClasses = getMobileTouchClasses();
      expect(defaultClasses).toContain("h-11 min-h-[44px]"); // medium size
      expect(defaultClasses).toContain("px-4 py-3");
      expect(defaultClasses).toContain("text-base");
      expect(defaultClasses).toContain("touch-manipulation");
      expect(defaultClasses).toContain("select-none");
    });

    it("should generate mobile touch classes with custom size", () => {
      const largeClasses = getMobileTouchClasses("large");
      expect(largeClasses).toContain("h-12 min-h-[48px]");

      const smallClasses = getMobileTouchClasses("small");
      expect(smallClasses).toContain("h-10 min-h-[40px]");
    });

    it("should generate mobile form classes", () => {
      const formClasses = getMobileFormClasses();
      expect(formClasses).toContain("w-full max-w-md mx-auto");
      expect(formClasses).toContain("space-y-4 sm:space-y-6");
      expect(formClasses).toContain("px-4 sm:px-6");
    });

    it("should generate mobile button classes for primary variant", () => {
      const primaryClasses = getMobileButtonClasses("primary");
      expect(primaryClasses).toContain("h-12 min-h-[48px]"); // large size
      expect(primaryClasses).toContain("w-full");
      expect(primaryClasses).toContain("bg-primary text-primary-foreground");
      expect(primaryClasses).toContain("hover:bg-primary/90");
      expect(primaryClasses).toContain("touch-manipulation");
      expect(primaryClasses).toContain("active:scale-[0.98]");
    });

    it("should generate mobile button classes for secondary variant", () => {
      const secondaryClasses = getMobileButtonClasses("secondary");
      expect(secondaryClasses).toContain("h-12 min-h-[48px]");
      expect(secondaryClasses).toContain("w-full");
      expect(secondaryClasses).toContain(
        "bg-secondary text-secondary-foreground border border-input"
      );
      expect(secondaryClasses).toContain("hover:bg-secondary/80");
    });
  });

  describe("Validation Timing", () => {
    it("should have correct validation timing settings", () => {
      expect(VALIDATION_TIMING.debounceMs).toBe(300);
      expect(VALIDATION_TIMING.validateOnBlur).toBe(true);
      expect(VALIDATION_TIMING.showErrorsOnSubmit).toBe(true);
    });
  });

  describe("Error Styles", () => {
    it("should have correct error style classes", () => {
      expect(ERROR_STYLES.container).toBe("min-h-[1.25rem] mt-1.5");
      expect(ERROR_STYLES.message).toBe("text-sm text-destructive font-medium");
      expect(ERROR_STYLES.icon).toBe("h-4 w-4 text-destructive inline mr-1.5");
    });
  });

  describe("Mobile Form Spacing", () => {
    it("should have correct spacing classes", () => {
      expect(MOBILE_FORM_SPACING.fieldGap).toBe("space-y-4 sm:space-y-6");
      expect(MOBILE_FORM_SPACING.labelMargin).toBe("mb-2 sm:mb-1.5");
      expect(MOBILE_FORM_SPACING.errorMargin).toBe("mt-1.5 sm:mt-1");
      expect(MOBILE_FORM_SPACING.buttonMargin).toBe("mt-6 sm:mt-4");
    });
  });
});
