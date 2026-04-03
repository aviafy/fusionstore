import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Safe for API fields that should be arrays but may arrive as objects or null. */
export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}
