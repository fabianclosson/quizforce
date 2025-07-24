"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  name: string;
}

const RadioGroupContext = React.createContext<
  RadioGroupContextType | undefined
>(undefined);

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, children, ...props }, ref) => {
    const generatedId = React.useId();
    const radioGroupName = name || `radio-group-${generatedId}`;

    return (
      <RadioGroupContext.Provider
        value={{ value, onValueChange, name: radioGroupName }}
      >
        <div
          className={cn("grid gap-2", className)}
          ref={ref}
          {...props}
          role="radiogroup"
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);

    if (!context) {
      throw new Error("RadioGroupItem must be used within a RadioGroup");
    }

    const { value: groupValue, onValueChange, name } = context;

    return (
      <input
        type="radio"
        name={name}
        value={value}
        checked={groupValue === value}
        onChange={e => {
          if (e.target.checked) {
            onValueChange?.(value);
          }
        }}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
