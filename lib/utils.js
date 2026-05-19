import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS ክላሶችን በአግባቡ ለመቀላቀል የሚረዳ ተግባር
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}