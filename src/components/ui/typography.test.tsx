import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyH5,
  TypographyH6,
  TypographyP,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
  TypographyLead,
  TypographyDisplay,
  TypographyBlockquote,
  TypographyCode,
  TypographyCaption,
  TypographyList,
  TypographyListItem,
  TypographyDemo,
} from "./typography";

describe("Typography Components", () => {
  describe("Heading Components", () => {
    it("renders TypographyH1 with correct styling", () => {
      render(<TypographyH1>Heading 1</TypographyH1>);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Heading 1");
    });

    it("renders TypographyH2 with correct styling", () => {
      render(<TypographyH2>Heading 2</TypographyH2>);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it("renders TypographyH3 with correct styling", () => {
      render(<TypographyH3>Heading 3</TypographyH3>);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it("renders TypographyH4 with correct styling", () => {
      render(<TypographyH4>Heading 4</TypographyH4>);
      const heading = screen.getByRole("heading", { level: 4 });
      expect(heading).toBeInTheDocument();
    });

    it("renders TypographyH5 with correct styling", () => {
      render(<TypographyH5>Heading 5</TypographyH5>);
      const heading = screen.getByRole("heading", { level: 5 });
      expect(heading).toBeInTheDocument();
    });

    it("renders TypographyH6 with correct styling", () => {
      render(<TypographyH6>Heading 6</TypographyH6>);
      const heading = screen.getByRole("heading", { level: 6 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe("Body Text Components", () => {
    it("renders TypographyP with correct styling", () => {
      render(<TypographyP>Paragraph text</TypographyP>);
      const paragraph = screen.getByText("Paragraph text");
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.tagName).toBe("P");
    });

    it("renders TypographyLarge with correct styling", () => {
      render(<TypographyLarge>Large text</TypographyLarge>);
      const text = screen.getByText("Large text");
      expect(text).toBeInTheDocument();
    });

    it("renders TypographySmall with correct styling", () => {
      render(<TypographySmall>Small text</TypographySmall>);
      const text = screen.getByText("Small text");
      expect(text).toBeInTheDocument();
      expect(text.tagName).toBe("SMALL");
    });

    it("renders TypographyMuted with correct styling", () => {
      render(<TypographyMuted>Muted text</TypographyMuted>);
      const text = screen.getByText("Muted text");
      expect(text).toBeInTheDocument();
    });

    it("renders TypographyLead with correct styling", () => {
      render(<TypographyLead>Lead text</TypographyLead>);
      const text = screen.getByText("Lead text");
      expect(text).toBeInTheDocument();
    });
  });

  describe("Display and Special Components", () => {
    it("renders TypographyDisplay with correct styling", () => {
      render(<TypographyDisplay>Display text</TypographyDisplay>);
      const text = screen.getByText("Display text");
      expect(text).toBeInTheDocument();
    });

    it("renders TypographyBlockquote with correct styling", () => {
      render(<TypographyBlockquote>Quote text</TypographyBlockquote>);
      const quote = screen.getByText("Quote text");
      expect(quote).toBeInTheDocument();
      expect(quote.tagName).toBe("BLOCKQUOTE");
    });

    it("renders TypographyCode with correct styling", () => {
      render(<TypographyCode>code</TypographyCode>);
      const code = screen.getByText("code");
      expect(code).toBeInTheDocument();
      expect(code.tagName).toBe("CODE");
    });

    it("renders TypographyCaption with correct styling", () => {
      render(<TypographyCaption>Caption text</TypographyCaption>);
      const caption = screen.getByText("Caption text");
      expect(caption).toBeInTheDocument();
      expect(caption.tagName).toBe("FIGCAPTION");
    });
  });

  describe("List Components", () => {
    it("renders TypographyList (unordered) with correct styling", () => {
      render(
        <TypographyList>
          <TypographyListItem>Item 1</TypographyListItem>
          <TypographyListItem>Item 2</TypographyListItem>
          <TypographyListItem>Item 3</TypographyListItem>
        </TypographyList>
      );

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
      expect(list.tagName).toBe("UL");
      expect(list).toHaveClass("space-y-2", "list-disc", "list-inside");

      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
      expect(screen.getByText("Item 3")).toBeInTheDocument();
    });

    it("renders TypographyList (ordered) with correct styling", () => {
      render(
        <TypographyList ordered>
          <TypographyListItem>First item</TypographyListItem>
          <TypographyListItem>Second item</TypographyListItem>
          <TypographyListItem>Third item</TypographyListItem>
        </TypographyList>
      );

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
      expect(list.tagName).toBe("OL");
      expect(list).toHaveClass("space-y-2", "list-decimal", "list-inside");

      expect(screen.getByText("First item")).toBeInTheDocument();
      expect(screen.getByText("Second item")).toBeInTheDocument();
      expect(screen.getByText("Third item")).toBeInTheDocument();
    });

    it("renders TypographyListItem with correct styling", () => {
      render(<TypographyListItem>List item</TypographyListItem>);
      const item = screen.getByText("List item");
      expect(item).toBeInTheDocument();
      expect(item.tagName).toBe("LI");
    });
  });

  describe("Custom Props and Styling", () => {
    it("accepts custom className props", () => {
      render(<TypographyH1 className="custom-class">Test</TypographyH1>);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveClass("custom-class");
    });

    it("accepts custom HTML attributes", () => {
      render(<TypographyP data-testid="custom-paragraph">Test</TypographyP>);
      const paragraph = screen.getByTestId("custom-paragraph");
      expect(paragraph).toBeInTheDocument();
    });

    it("accepts HTML attributes correctly", () => {
      render(<TypographyH1 id="test-heading">Test</TypographyH1>);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveAttribute("id", "test-heading");
    });
  });

  describe("Responsive Behavior", () => {
    it("applies fluid typography classes", () => {
      render(<TypographyH1>Test</TypographyH1>);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it("applies display typography classes", () => {
      render(<TypographyDisplay>Test</TypographyDisplay>);
      const text = screen.getByText("Test");
      expect(text).toBeInTheDocument();
    });
  });

  describe("Typography Demo", () => {
    it("renders all typography variants in demo", () => {
      render(<TypographyDemo />);

      // Check for main sections
      expect(
        screen.getByText("Responsive Typography System")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Heading 1 - Main Page Title")
      ).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => {
          return content.includes("This is a paragraph with fluid typography");
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => {
          return content.includes(
            "Typography is the craft of endowing human language"
          );
        })
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("maintains proper heading hierarchy", () => {
      render(
        <div>
          <TypographyH1>Level 1</TypographyH1>
          <TypographyH2>Level 2</TypographyH2>
          <TypographyH3>Level 3</TypographyH3>
        </div>
      );

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    });

    it("provides proper semantic structure for lists", () => {
      render(
        <TypographyList>
          <TypographyListItem>Item 1</TypographyListItem>
          <TypographyListItem>Item 2</TypographyListItem>
        </TypographyList>
      );

      const list = screen.getByRole("list");
      const listItems = screen.getAllByRole("listitem");

      expect(list).toBeInTheDocument();
      expect(listItems).toHaveLength(2);
    });

    it("uses proper blockquote semantics", () => {
      render(<TypographyBlockquote>Quote</TypographyBlockquote>);
      const quote = screen.getByText("Quote");
      expect(quote.tagName).toBe("BLOCKQUOTE");
    });
  });
});
