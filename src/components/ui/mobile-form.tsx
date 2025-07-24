"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import { Label } from "./label";
import { Alert, AlertDescription } from "./alert";
import {
  getMobileFormClasses,
  getMobileButtonClasses,
  MOBILE_FORM_SPACING,
  ERROR_STYLES,
  A11Y_HELPERS,
} from "@/lib/mobile-form-utils";

export interface MobileFormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  mobilePreset?:
    | "email"
    | "password"
    | "newPassword"
    | "phone"
    | "firstName"
    | "lastName"
    | "search";
  placeholder?: string;
  value?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  children?: React.ReactNode; // For custom input content (icons, etc.)
}

export function MobileFormField({
  id,
  name,
  label,
  type = "text",
  mobilePreset,
  placeholder,
  value,
  error,
  required = false,
  disabled = false,
  autoComplete,
  onChange,
  onBlur,
  children,
}: MobileFormFieldProps) {
  const errorId = A11Y_HELPERS.generateErrorId("mobile-form", name);
  const fieldId = A11Y_HELPERS.generateFieldId("mobile-form", id);

  const ariaProps = A11Y_HELPERS.getFieldAria(label, !!error, errorId);

  return (
    <div className="space-y-2">
      {/* Label */}
      <Label
        htmlFor={fieldId}
        className={cn(
          "block text-sm font-medium",
          MOBILE_FORM_SPACING.labelMargin,
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}
      >
        {label}
      </Label>

      {/* Input Container */}
      <div className="relative">
        {children ? (
          // Custom input with children (icons, etc.)
          <div className="relative">
            <Input
              id={fieldId}
              name={name}
              type={type}
              mobilePreset={mobilePreset}
              placeholder={placeholder}
              value={value}
              disabled={disabled}
              autoComplete={autoComplete}
              touchOptimized
              inputSize="md"
              className={cn(
                error && "border-destructive focus-visible:border-destructive",
                children && "pl-10" // Space for icon
              )}
              onChange={e => onChange?.(e.target.value)}
              onBlur={onBlur}
              {...ariaProps}
            />
            {children}
          </div>
        ) : (
          // Standard input
          <Input
            id={fieldId}
            name={name}
            type={type}
            mobilePreset={mobilePreset}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            autoComplete={autoComplete}
            touchOptimized
            inputSize="md"
            className={
              error ? "border-destructive focus-visible:border-destructive" : ""
            }
            onChange={e => onChange?.(e.target.value)}
            onBlur={onBlur}
            {...ariaProps}
          />
        )}
      </div>

      {/* Error Message */}
      <div className={ERROR_STYLES.container}>
        {error && (
          <p
            id={errorId}
            className={ERROR_STYLES.message}
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export interface MobileFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  title?: string;
  description?: string;
  submitText?: string;
  isSubmitting?: boolean;
  error?: string;
}

export function MobileForm({
  children,
  onSubmit,
  className,
  title,
  description,
  submitText = "Submit",
  isSubmitting = false,
  error,
}: MobileFormProps) {
  return (
    <div className={cn(getMobileFormClasses(), className)}>
      {/* Form Header */}
      {(title || description) && (
        <div className="text-center space-y-2 mb-6">
          {title && (
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Global Error */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {children}

        {/* Submit Button */}
        <div className={MOBILE_FORM_SPACING.buttonMargin}>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={getMobileButtonClasses("primary")}
          >
            {isSubmitting ? "Please wait..." : submitText}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Example usage component
export function MobileFormExample() {
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    console.log("Form submitted:", formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <MobileForm
      title="Mobile-Optimized Form"
      description="Experience the enhanced mobile form with optimized inputs and touch targets"
      onSubmit={handleSubmit}
      submitText="Create Account"
      isSubmitting={isSubmitting}
    >
      <MobileFormField
        id="firstName"
        name="firstName"
        label="First Name"
        mobilePreset="firstName"
        placeholder="First name"
        value={formData.firstName}
        error={errors.firstName}
        required
        onChange={value => updateField("firstName", value)}
      />

      <MobileFormField
        id="lastName"
        name="lastName"
        label="Last Name"
        mobilePreset="lastName"
        placeholder="Last name"
        value={formData.lastName}
        error={errors.lastName}
        required
        onChange={value => updateField("lastName", value)}
      />

      <MobileFormField
        id="email"
        name="email"
        label="Email Address"
        mobilePreset="email"
        placeholder="your-email@example.com"
        value={formData.email}
        error={errors.email}
        required
        onChange={value => updateField("email", value)}
      />

      <MobileFormField
        id="phone"
        name="phone"
        label="Phone Number"
        mobilePreset="phone"
        placeholder="+1 (555) 123-4567"
        value={formData.phone}
        error={errors.phone}
        onChange={value => updateField("phone", value)}
      />

      <MobileFormField
        id="password"
        name="password"
        label="Password"
        mobilePreset="newPassword"
        placeholder="Create a secure password"
        value={formData.password}
        error={errors.password}
        required
        onChange={value => updateField("password", value)}
      />
    </MobileForm>
  );
}
