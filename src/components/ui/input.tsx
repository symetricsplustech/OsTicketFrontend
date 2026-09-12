import React from "react";
import { classNames } from "@shared/lib/classNames";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={classNames(
      "flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";
