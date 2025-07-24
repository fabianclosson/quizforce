"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY_COMPONENTS, A11Y_TYPOGRAPHY } from "@/lib/typography-utils";

// Base typography component interface
interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

// Heading components with responsive typography
export function TypographyH1({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  const Comp = asChild ? React.Fragment : "h1";

  return (
    <Comp
      className={cn(
        TYPOGRAPHY_COMPONENTS.h1,
        A11Y_TYPOGRAPHY.focusRing,
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function TypographyH2({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  const Comp = asChild ? React.Fragment : "h2";

  return (
    <Comp
      className={cn(
        TYPOGRAPHY_COMPONENTS.h2,
        A11Y_TYPOGRAPHY.focusRing,
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function TypographyH3({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  const Comp = asChild ? React.Fragment : "h3";

  return (
    <Comp
      className={cn(
        TYPOGRAPHY_COMPONENTS.h3,
        A11Y_TYPOGRAPHY.focusRing,
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function TypographyH4({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  const Comp = asChild ? React.Fragment : "h4";

  return (
    <Comp
      className={cn(
        TYPOGRAPHY_COMPONENTS.h4,
        A11Y_TYPOGRAPHY.focusRing,
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function TypographyH5({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  const Comp = asChild ? React.Fragment : "h5";

  return (
    <Comp
      className={cn(
        TYPOGRAPHY_COMPONENTS.h5,
        A11Y_TYPOGRAPHY.focusRing,
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function TypographyH6({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  const Comp = asChild ? React.Fragment : "h6";

  return (
    <Comp
      className={cn(
        TYPOGRAPHY_COMPONENTS.h6,
        A11Y_TYPOGRAPHY.focusRing,
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// Body text components
export function TypographyP({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) {
  const Comp = asChild ? React.Fragment : "p";

  return (
    <Comp className={cn(TYPOGRAPHY_COMPONENTS.body, className)} {...props}>
      {children}
    </Comp>
  );
}

export function TypographySmall({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  const Comp = asChild ? React.Fragment : "small";

  return (
    <Comp
      className={cn(TYPOGRAPHY_COMPONENTS["body-sm"], className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function TypographyLarge({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLDivElement>) {
  const Comp = asChild ? React.Fragment : "div";

  return (
    <Comp
      className={cn(TYPOGRAPHY_COMPONENTS["body-lg"], className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

// Display text for hero sections
export function TypographyDisplay({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  const Comp = asChild ? React.Fragment : "h1";

  return (
    <Comp
      className={cn(
        TYPOGRAPHY_COMPONENTS.display,
        A11Y_TYPOGRAPHY.focusRing,
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// Quote/blockquote component
export function TypographyBlockquote({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLQuoteElement>) {
  const Comp = asChild ? React.Fragment : "blockquote";

  return (
    <Comp
      className={cn(
        TYPOGRAPHY_COMPONENTS.quote,
        "border-l-4 border-primary/20 pl-6 my-6",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// Code component
export function TypographyCode({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  const Comp = asChild ? React.Fragment : "code";

  return (
    <Comp
      className={cn(
        TYPOGRAPHY_COMPONENTS.code,
        "bg-muted px-1.5 py-0.5 rounded-md",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// Caption component
export function TypographyCaption({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  const Comp = asChild ? React.Fragment : "figcaption";

  return (
    <Comp
      className={cn(
        TYPOGRAPHY_COMPONENTS.caption,
        "text-muted-foreground mt-2",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// Lead text component for introductory paragraphs
export function TypographyLead({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) {
  const Comp = asChild ? React.Fragment : "p";

  return (
    <Comp
      className={cn(
        "text-[clamp(1.125rem,2.5vw,1.375rem)]", // Slightly larger than body
        "leading-relaxed",
        "text-muted-foreground",
        "max-w-[55ch]",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// Muted text component
export function TypographyMuted({
  children,
  className,
  asChild = false,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  const Comp = asChild ? React.Fragment : "p";

  return (
    <Comp
      className={cn(
        TYPOGRAPHY_COMPONENTS["body-sm"],
        "text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// List components with proper typography
export function TypographyList({
  children,
  className,
  ordered = false,
  ...props
}: TypographyProps &
  React.HTMLAttributes<HTMLUListElement | HTMLOListElement> & {
    ordered?: boolean;
  }) {
  const Comp = ordered ? "ol" : "ul";

  return (
    <Comp
      className={cn(
        "space-y-2",
        "text-[clamp(1rem,2vw,1.125rem)]",
        "leading-relaxed",
        "max-w-[65ch]",
        ordered ? "list-decimal list-inside" : "list-disc list-inside",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function TypographyListItem({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={cn(
        "text-[clamp(1rem,2vw,1.125rem)]",
        "leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </li>
  );
}

// Typography demo component
export function TypographyDemo() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      <div className="space-y-4">
        <TypographyDisplay>Responsive Typography System</TypographyDisplay>

        <TypographyLead>
          A comprehensive typography system built with fluid scaling, optimal
          readability, and mobile-first responsive design principles.
        </TypographyLead>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <TypographyH1>Heading 1 - Main Page Title</TypographyH1>
          <TypographyH2>Heading 2 - Section Title</TypographyH2>
          <TypographyH3>Heading 3 - Subsection Title</TypographyH3>
          <TypographyH4>Heading 4 - Content Group</TypographyH4>
          <TypographyH5>Heading 5 - Small Section</TypographyH5>
          <TypographyH6>Heading 6 - Minor Heading</TypographyH6>
        </div>

        <div className="space-y-4">
          <TypographyP>
            This is a paragraph with fluid typography that scales smoothly
            across all device sizes. The text remains readable and comfortable
            to read whether you&apos;re on a mobile phone or a large desktop screen.
          </TypographyP>

          <TypographyLarge>
            This is larger body text, perfect for lead paragraphs or important
            content that needs more emphasis.
          </TypographyLarge>

          <TypographySmall>
            This is smaller text, ideal for captions, footnotes, or
            supplementary information.
          </TypographySmall>

          <TypographyMuted>
            This is muted text with reduced opacity, perfect for less important
            information.
          </TypographyMuted>
        </div>

        <TypographyBlockquote>
          &quot;Typography is the craft of endowing human language with a durable
          visual form.&quot;
          <br />— Robert Bringhurst
        </TypographyBlockquote>

        <div className="space-y-4">
          <TypographyH3>Code Example</TypographyH3>
          <TypographyP>
            You can use inline code like{" "}
            <TypographyCode>const example = &quot;responsive&quot;</TypographyCode> within
            your text.
          </TypographyP>
        </div>

        <div className="space-y-4">
          <TypographyH3>List Example</TypographyH3>
          <TypographyList>
            <TypographyListItem>
              Fluid typography with CSS clamp
            </TypographyListItem>
            <TypographyListItem>
              Optimal line lengths for readability
            </TypographyListItem>
            <TypographyListItem>
              Mobile-first responsive design
            </TypographyListItem>
            <TypographyListItem>
              Accessibility-focused implementation
            </TypographyListItem>
          </TypographyList>
        </div>

        <div className="space-y-4">
          <TypographyH3>Ordered List Example</TypographyH3>
          <TypographyList ordered>
            <TypographyListItem>
              Research typography best practices
            </TypographyListItem>
            <TypographyListItem>Create fluid scaling system</TypographyListItem>
            <TypographyListItem>
              Implement responsive components
            </TypographyListItem>
            <TypographyListItem>
              Test across all device sizes
            </TypographyListItem>
          </TypographyList>
        </div>

        <figure className="space-y-2">
          <div className="bg-muted p-4 rounded-lg">
            <TypographyP>This is content inside a figure element.</TypographyP>
          </div>
          <TypographyCaption>
            Figure 1: Example of responsive typography in action
          </TypographyCaption>
        </figure>
      </div>
    </div>
  );
}
