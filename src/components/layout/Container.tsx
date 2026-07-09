import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const widths = {
  narrow: "max-w-3xl", // prose, checkout
  default: "max-w-7xl", // standard sections
  wide: "max-w-wide", // hero / editorial moments (--container-wide)
} as const;

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: keyof typeof widths;
}

/** Centered max-width wrapper with responsive side padding on the 8px grid. */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ width = "default", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mx-auto w-full px-6 md:px-10", widths[width], className)}
      {...props}
    />
  ),
);
Container.displayName = "Container";
