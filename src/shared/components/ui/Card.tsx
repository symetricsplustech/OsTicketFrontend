import React from "react";
import { classNames } from "@shared/lib/classNames";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames("card", className)} {...props} />;
}
