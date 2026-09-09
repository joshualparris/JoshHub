import * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white text-neutral-900 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-50",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("p-4 pb-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none text-neutral-900 dark:text-slate-50",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: CardProps) {
  return (
    <p className={cn("text-sm text-neutral-600 dark:text-slate-200", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("px-4 pb-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return <div className={cn("flex items-center p-4 pt-0", className)} {...props} />;
}
