import { cn, formatCurrency, formatDate, generateId } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
    });

    it("should handle conditional classes", () => {
      expect(cn("base-class", false && "conditional", "always-present")).toBe(
        "base-class always-present"
      );
    });

    it("should merge Tailwind classes properly", () => {
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    });
  });

  describe("formatCurrency", () => {
    it("should format currency correctly", () => {
      expect(formatCurrency(99.99)).toBe("$99.99");
      expect(formatCurrency(1000)).toBe("$1,000.00");
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("should handle negative numbers", () => {
      expect(formatCurrency(-50.25)).toBe("-$50.25");
    });
  });

  describe("formatDate", () => {
    it("should format date objects correctly", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const formatted = formatDate(date);
      expect(formatted).toContain("January");
      expect(formatted).toContain("2024");
    });

    it("should format date strings correctly", () => {
      const formatted = formatDate("2024-12-25T12:00:00Z");
      expect(formatted).toContain("December");
      expect(formatted).toContain("2024");
    });
  });

  describe("generateId", () => {
    it("should generate a unique string", () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(typeof id1).toBe("string");
      expect(typeof id2).toBe("string");
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
    });

    it("should generate different IDs each time", () => {
      const ids = Array.from({ length: 10 }, () => generateId());
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(10);
    });
  });
});
