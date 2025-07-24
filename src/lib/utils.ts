import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Price formatting utility - moved from stripe.ts to make it client-safe
export const formatPrice = (cents: number): string => {
  // Handle invalid inputs
  if (cents == null || isNaN(cents)) return "Contact for Price";
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
};
