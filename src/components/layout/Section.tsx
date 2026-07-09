import { createElement, forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const backgrounds = {
  blush: "bg-blush",
  "blush-2": "bg-blush-2",
  white: "bg-white",
  "footer-pink": "bg-footer-pink",
  none: "",
} as const;

const rhythms = {
  default: "py-section", // between major sections
  compact: "py-section-sm", // tighter moments
  none: "",
} as const;

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "header" | "footer" | "aside";
  bg?: keyof typeof backgrounds;
  rhythm?: keyof typeof rhythms;
}

/** Layout band applying the locked section rhythm and a token background. */
export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ as = "section", bg = "none", rhythm = "default", className, ...props }, ref) =>
    createElement(as, {
      ref,
      className: cn("relative", backgrounds[bg], rhythms[rhythm], className),
      ...props,
    }),
);
Section.displayName = "Section";
