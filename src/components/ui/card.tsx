import React from "react";
import { classNames } from "@shared/lib/classNames";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps) {
  return <div className={classNames("card", className)} {...props} />;
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={classNames("p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: DivProps) {
  return (
    <h3
      className={classNames(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={classNames("p-6 pt-0", className)} {...props} />;
}
