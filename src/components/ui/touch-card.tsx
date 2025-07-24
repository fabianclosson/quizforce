import * as React from "react";
import { cn } from "@/lib/utils";
import { createTouchCard } from "@/lib/touch-utils";

export interface TouchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle";
  interactive?: boolean;
  asChild?: boolean;
}

const TouchCard = React.forwardRef<HTMLDivElement, TouchCardProps>(
  (
    { className, variant = "default", interactive = true, children, ...props },
    ref
  ) => {
    const baseClasses = "bg-card text-card-foreground rounded-lg border";
    const interactiveClasses = interactive ? createTouchCard(variant) : "p-6";

    return (
      <div
        ref={ref}
        className={cn(baseClasses, interactiveClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TouchCard.displayName = "TouchCard";

const TouchCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
    {...props}
  />
));
TouchCardHeader.displayName = "TouchCardHeader";

const TouchCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
TouchCardTitle.displayName = "TouchCardTitle";

const TouchCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
TouchCardDescription.displayName = "TouchCardDescription";

const TouchCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-4", className)} {...props} />
));
TouchCardContent.displayName = "TouchCardContent";

const TouchCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-4", className)}
    {...props}
  />
));
TouchCardFooter.displayName = "TouchCardFooter";

export {
  TouchCard,
  TouchCardHeader,
  TouchCardFooter,
  TouchCardTitle,
  TouchCardDescription,
  TouchCardContent,
};
